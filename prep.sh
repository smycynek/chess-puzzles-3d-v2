#! /bin/bash
rm -rf chess3d
rm chess3d.zip

npx ng build  --configuration=production --base-href /chess3d/

zip -r chess3d.zip chess3d