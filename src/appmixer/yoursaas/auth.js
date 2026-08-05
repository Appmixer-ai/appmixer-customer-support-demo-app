module.exports = {
  type: "apiKey",
  definition: {
    auth: {
      apiKey: {
        type: "text",
        name: "API Key",
        tooltip:
          "Enter your API key from the application settings",
        required: true,
      },
      baseUrl: {
        type: "text",
        name: "Base URL",
        tooltip:
          "Your API base URL (e.g., https://demo-tickets.appmixer.com)",
        required: true,
      },
    },

    validate: async function (context) {
      const { apiKey, baseUrl } = context;

      try {
        const headers = {
          "X-Api-Key": apiKey,
          "Content-Type": "application/json",
        };

        const response = await context.httpRequest({
          method: "GET",
          url: `${baseUrl}/api/tickets?action=stats`,
          headers,
        });

        if (response.status !== 200) {
          throw new Error("Invalid API key or connection failed");
        }

        return response.data;
      } catch (error) {
        throw new Error(`Authentication failed: ${error.message}`);
      }
    },

    accountNameFromProfileInfo: "name",

    requestProfileInfo: async function (context) {

      return {
        name: "YourSaaS Account",
      
      };
    }

  },
};