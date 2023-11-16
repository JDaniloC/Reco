const isProduction = process.env.NODE_ENV === 'production';

const branchPath = process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL;
const vercelPath = process.env.NEXT_PUBLIC_VERCEL_URL;
const prodPath = branchPath ? branchPath : vercelPath;

const protocol = isProduction ? 'https://' : 'http://';
const urlName = isProduction ? prodPath : 'localhost:3000';
export const serverURL = protocol + urlName;

export const apiURL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!apiURL) {
  console.error(
    'Please define the NEXT_PUBLIC_BACKEND_URL environment variable inside .env.local'
  );
}