#! /bin/bash


npx ng build  --configuration=production --base-href /chess3d/

zip -r chess3d.zip chess3d