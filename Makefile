publish:
	mkdir -p build
	pandoc --katex --mathjax --section-divs --from=markdown+emoji --to=html5+smart  --template ../blog/templates/template.html --self-contained --css ../blog/content/css/tufte-extra.css --css ../blog/content/css/pandoc.css --css ../blog/content/css/pandoc-solarized.css --css ../blog/content/css/tufte.css --css ../blog/content/css/latex.css --css ../blog/templates/template.css -M title="About Me" --filter=pandoc-sidenote --filter=pandoc-eqnos --filter=pandoc-fignos --filter=pandoc-tablenos --filter pandoc-citeproc --csl ../blog/templates/csl.csl --metadata link-citations=true --email-obfuscation javascript --base-header-level=2 index.md -o build/index.html

deploy: publish
	-git branch -D master
	-git push origin --delete master
	ghp-import -n -c "kdheepak.com" -m "Create website" -p -f build -b master

