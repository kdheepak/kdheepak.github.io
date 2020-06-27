publish:
	mkdir -p build
	pandoc --katex --mathjax --section-divs --from=markdown+emoji --to=html5+smart  --template templates/template.html --self-contained --css css/tufte-extra.css --css css/pandoc.css --css css/tufte.css --css css/latex.css --css templates/template.css -M title="Me" --filter=pandoc-eqnos --filter=pandoc-fignos --filter=pandoc-tablenos --filter pandoc-citeproc --csl templates/csl.csl --metadata link-citations=true --email-obfuscation javascript --base-header-level=2 index.md -o build/index.html
	cp sitemap.xml build/sitemap.xml
	cp 404.html build/404.html

deploy: publish
	-git branch -D master
	-git push origin --delete master
	ghp-import -n -c "kdheepak.com" -m "Create website" -p -f build -b master
