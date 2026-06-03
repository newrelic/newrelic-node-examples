import nextConfig from 'eslint-config-next'

const config = [
  ...nextConfig,
  {
    languageOptions: {
      globals: {
        process: 'readonly',
        module: 'writable',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly'
      }
    }
  }
]

export default config
