import eslintConfig from "@drwade/eslint-config";

export default [
    ...eslintConfig,
    { 
        ignores: ["src/client/components/ui/**"]
    },
    {
        rules: {
            "no-console": "off"
        }
    }
];