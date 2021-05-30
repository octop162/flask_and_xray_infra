import {config} from 'dotenv'
config()

const env = process.env
export const AWS_DEFAULT_REGION = env.AWS_DEFAULT_REGION
export const AWS_ACCOUNT_ID = env.AWS_ACCOUNT_ID
