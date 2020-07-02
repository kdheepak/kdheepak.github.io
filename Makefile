publish:
	mkdir -p build
	pandoc --from=markdown+emoji+grid_tables+fenced_code_blocks --to=html5+smart -M title="Me" --template templates/template.html --self-contained --css css/github.css --css css/kudos.css --css css/tufte-extra.css --css css/pandoc.css --css css/table.css --css css/tufte.css --css css/latex.css --css css/table.css --css templates/template.css --email-obfuscation javascript --shift-heading-level=0 --katex --mathjax=https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js?config=TeX-MML-AM_CHTML --section-divs --include-after-body=templates/template.js --csl templates/csl.csl --metadata link-citations=true --metadata notes-after-punctuation=false --metadata reference-section-title="References" --metadata slug=index --lua-filter=scripts/links-targets-blank.lua index.md -o build/index.html
	cp sitemap.xml build/sitemap.xml
	cp 404.html build/404.html

deploy: publish
	-git branch -D master
	-git push origin --delete master
	ghp-import -n -c "kdheepak.com" -m "Create website" -p -f build -b master
