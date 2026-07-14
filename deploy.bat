@echo off
rem Commit all changes
git add -A
git commit -m "Fix modal responsive sizing and improve contrast on dark sections"

rem Build the project (Next.js)
npm run build

rem Deploy to Vercel (replace with your deployment command if different)
vercel --prod

echo Deployment script finished.
