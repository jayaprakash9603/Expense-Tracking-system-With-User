module.exports = {
  root: true,
  extends: ["react-app"],
  rules: {
    "no-restricted-imports": [
      "warn",
      {
        paths: [
          {
            name: "axios",
            message:
              "Import HTTP via @platform or config/api. Direct axios is only allowed under src/platform/http/**.",
          },
        ],
        patterns: [
          {
            group: ["@mui/material", "@mui/material/*"],
            message:
              "Prefer design-system primitives from components/ui (@ui). Raw MUI is discouraged in new feature code.",
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ["src/platform/http/**/*.{js,jsx}"],
      rules: {
        "no-restricted-imports": "off",
      },
    },
    {
      files: [
        "src/features/expenses/**/*.{js,jsx}",
        "src/features/bills/**/*.{js,jsx}",
        "src/platform/**/*.{js,jsx}",
        "src/api/**/*.{js,jsx}",
      ],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [
              {
                name: "axios",
                message:
                  "Migrated code must use HttpPort / repositories, not axios directly.",
              },
            ],
          },
        ],
      },
    },
    {
      files: ["src/features/*/usecases/**/*.{js,jsx}"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [
              {
                name: "react",
                message: "Use-cases must be pure JS — no React.",
              },
              {
                name: "react-redux",
                message: "Use-cases must be pure JS — no Redux.",
              },
              {
                name: "axios",
                message: "Use-cases must depend on ports, not axios.",
              },
            ],
          },
        ],
      },
    },
    {
      files: ["src/components/ui/**/*.{js,jsx}"],
      rules: {
        "no-restricted-imports": "off",
      },
    },
  ],
};
