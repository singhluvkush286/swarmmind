// SwarmMind — Azure Infrastructure as Code
// Microsoft Build AI Hackathon 2026
// Deploys: Azure OpenAI, Azure AI Foundry, Container Apps, Key Vault

@description('Location for all resources')
param location string = resourceGroup().location

@description('Unique suffix for resource names')
param suffix string = uniqueString(resourceGroup().id)

@description('Azure OpenAI GPT-4o deployment name')
param gpt4oDeploymentName string = 'gpt-4o'

// ── Azure OpenAI ─────────────────────────────────────────────────────────────
resource openAI 'Microsoft.CognitiveServices/accounts@2024-04-01-preview' = {
  name: 'swarmmind-aoai-${suffix}'
  location: location
  kind: 'OpenAI'
  sku: { name: 'S0' }
  properties: {
    customSubDomainName: 'swarmmind-${suffix}'
    publicNetworkAccess: 'Enabled'
  }
}

resource gpt4oDeployment 'Microsoft.CognitiveServices/accounts/deployments@2024-04-01-preview' = {
  parent: openAI
  name: gpt4oDeploymentName
  sku: { name: 'Standard', capacity: 40 }
  properties: {
    model: {
      format: 'OpenAI'
      name: 'gpt-4o'
      version: '2024-08-06'
    }
    versionUpgradeOption: 'OnceNewDefaultVersionAvailable'
  }
}

// ── Azure AI Foundry (Hub + Project) ─────────────────────────────────────────
resource aiHub 'Microsoft.MachineLearningServices/workspaces@2024-04-01' = {
  name: 'swarmmind-hub-${suffix}'
  location: location
  kind: 'Hub'
  identity: { type: 'SystemAssigned' }
  properties: {
    friendlyName: 'SwarmMind AI Hub'
    description: 'Microsoft Build AI Hackathon 2026 — SwarmMind Agent Swarms'
  }
}

resource aiProject 'Microsoft.MachineLearningServices/workspaces@2024-04-01' = {
  name: 'swarmmind-project-${suffix}'
  location: location
  kind: 'Project'
  identity: { type: 'SystemAssigned' }
  properties: {
    friendlyName: 'SwarmMind Project'
    hubResourceId: aiHub.id
  }
}

// ── Azure Key Vault ───────────────────────────────────────────────────────────
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: 'swarmmind-kv-${suffix}'
  location: location
  properties: {
    sku: { family: 'A', name: 'standard' }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    enableSoftDelete: true
  }
}

// ── Container Apps Environment ────────────────────────────────────────────────
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: 'swarmmind-logs-${suffix}'
  location: location
  properties: { sku: { name: 'PerGB2018' }, retentionInDays: 30 }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: 'swarmmind-ai-${suffix}'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
  }
}

resource caEnvironment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: 'swarmmind-env-${suffix}'
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

// ── Container App (Backend) ───────────────────────────────────────────────────
resource backendApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: 'swarmmind-backend-${suffix}'
  location: location
  identity: { type: 'SystemAssigned' }
  properties: {
    managedEnvironmentId: caEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8000
        corsPolicy: {
          allowedOrigins: ['*']
          allowedMethods: ['GET', 'POST', 'OPTIONS']
          allowedHeaders: ['*']
        }
      }
      secrets: [
        { name: 'azure-openai-key', value: openAI.listKeys().key1 }
      ]
    }
    template: {
      containers: [
        {
          name: 'swarmmind-backend'
          image: 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest' // replace with your image
          resources: { cpu: json('0.5'), memory: '1Gi' }
          env: [
            { name: 'AZURE_OPENAI_ENDPOINT',   value: openAI.properties.endpoint }
            { name: 'AZURE_OPENAI_DEPLOYMENT', value: gpt4oDeploymentName }
            { name: 'AZURE_OPENAI_API_KEY',    secretRef: 'azure-openai-key' }
            { name: 'APPLICATIONINSIGHTS_CONNECTION_STRING', value: appInsights.properties.ConnectionString }
          ]
        }
      ]
      scale: { minReplicas: 0, maxReplicas: 10 }
    }
  }
}

// ── Outputs ───────────────────────────────────────────────────────────────────
output openAIEndpoint string       = openAI.properties.endpoint
output backendUrl string           = 'https://${backendApp.properties.configuration.ingress.fqdn}'
output aiProjectName string        = aiProject.name
output keyVaultName string         = keyVault.name
output appInsightsKey string       = appInsights.properties.InstrumentationKey
