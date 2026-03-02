#!/bin/bash
cd /home/kavia/workspace/code-generation/viraltrend-connect-241544-241554/frontend_app
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

