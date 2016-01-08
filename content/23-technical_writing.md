---
title: Writing Technical Papers with Markdown
date: Sunday, Dec 20th
tags: markdown, writing
summary: Use Markdown for Academic writing
keywords: markdown, vim, writing, academic, scholarly, scientific, papers
slug: writing-papers-with-markdown
category: blog
alias: /blog/writing-papers-with-markdown
bibliography: blog.bib
abstract: Recently, I’ve had several people ask me about the Markdown workflow I use to write papers. I figured I'd use this post to write about my workflow and my resources on this topic.
---

\begin{IEEEkeywords}
Pandoc, LaTeX, Markdown 
\end{IEEEkeywords}

<!-- BEGIN COMMENT -->

Recently, I’ve had several people ask me about the Markdown workflow I use to write papers. 
I figured I'd use this post to write about my workflow and my resources on this topic.

<!-- END COMMENT -->

# Why Markdown

Academic writing involves writing down ideas as they come along (notetaking), experimenting with these ideas (data analysis), and finally presenting them effectively (scientific paper).
There's a lot to manage over the length of time this entire process spans.
Academics require a set of tools that aid in making this process i.e. the effective communication of ideas, as seamless as possible.
There are currently two popular options for academics seeking to write technical papers - Microsoft Word or \LaTeX

## A word about Word 

Microsoft Word is ubiquitous when it comes to writing reports. 
The great thing about Word is that there is almost no barrier to *begin* writing.
You can incrementally build your skill set after you start using Word.
This is useful since it makes it immediately accessible, thereby decreasing the time spent on what tool you are using for writing and allowing you to concentrate on the writing itself.

However, I've found a few fundamental problems with Microsoft Word. 

Having a WYSIWYG (What You See Is What You Get) editor is great (even Richard Stallman seems to think so [@stallman_emacs]).
However, products like Word fail miserably at separating content from formatting.
These products impose on the writer their own concept of how a document should be formatted, which I've found greatly hinders the writing process.
Have you ever experienced a sudden jump in spacing? 
Or mismatched formatting after a copy and paste from one part of the document to another? 
Or have indents and bullet points misbehave haphazardly?
Word seemingly applies formatting changes seemingly at random!
These are all typesetting and formatting processes and these should be applied **after** the text is completed.
These processes should not distract from the task at hand [^1] - writing!


There are other issues as well.
Microsoft's ecosystem comes at a price, literally.
Word is proprietary, and Word's format is a proprietary data format.
When you use Word, by storing your work in this proprietary software's proprietary data format, you tie yourself down to this particular licensed software for the forseeable future.
When you use Word, you make the implicit assumption that everyone you work with has the same software on their computer. 
Word also does not play well with its counterparts on OSX. 
With the same content, the document is presented differently depending on which machine you open it on.
As far as I know there isn't even a version for Linux machines.
Heck, Microsoft Word does not even play well with previous versions of Microsoft Word.
I understand why this issue occurs, considering complexity in operating systems and software, but why is this so widely accepted?
Backward incompatible software or cross incompatibility are probably inevitable. 
But as an user, I shouldn't have to be concerned about this.
I shouldn't have to think about what software or what version my reviewers are using when I'm sending them a document.
And speaking of sharing documents, did you know you can end up transferring malware through a Word document?
Just think about that for a second. 
Opening what is essentially a text file could be a security threat for your machine.
And some of these viruses (as of the time of this writing) do not even have patches yet [@beaumont_bypass_2015].
Loads of people have already talked about this and similar issues at some length [@steingold_proprietary, @cottrell_word], and have probably done more justice to this topic that I possibly could.

But I hear what you are saying.
You have already invested in Microsoft Word and have prescient knowledge to work around this tool's mysterious formatting randomness.
You use a Windows machine, and everyone around you who you wish to share this document with uses a Windows machine as well.
You don't really care if the software you use is proprietary, as long as you can get the job done.
And you are pretty careful about what links you click. 
Even if you agree with all those things, I still feel there is a case to be made about why you should consider dropping Word for your next paper.

* Word is slow, and consumes sometimes up to a gig of virtual memory. For what is basically a word processor, that is unnecessary.
* There is no good clean way to permanently save comments or notes in Word, that persist in the final version without affecting how final document looks.
* Collaborating with other people when using Word requires foresight and planning. 
* The equation editor painful to use.
* Word does not work in the workflow for ***scientific research papers or reports***.

Assuming scientific research papers consist of only 3 steps (if only!) - notetaking, analysis and presentation - Word fails at delivering in any of these steps.

Word doesn't quite work for notetaking.
Org mode, Evernote or Onenote are most people's preferred solution.
Word doesn't fit data analysis requirements as well, with Python, R or Excel being the go-to tools.
I personally use Emacs / Vim for notetaking and store them in a git repository and all of my data analysis is done in Jupyter Notebooks.
After collecting the required data from an experiment and post processing it, I can save plots into an image or the data into a table in a particular format programmatically using scripts.
Word however, does not allow me to import these images or tables programmatically.
Word just does not fit into typical analysis or research workflows.
To quote Raymond Hettinger :

![](images/raymondhettinger.jpg)


## \LaTeX - lah-tekh, lah-tek or lay-tek

Enter \LaTeX

> LaTeX is to a book what a set of blueprints is to a building. [@_stackoverflow]

\LaTeX is a typesetting system that uses the TeX program and is frequently used in scientific, technical and mathematical papers.
It is infamous for displaying equations in a manner that looks great.

\begin{align}
  \hskip6em \nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} & = \frac{4\pi}{c}\vec{\mathbf{j}} \hskip6em \\
  \nabla \cdot \vec{\mathbf{E}} & = 4 \pi \rho \\
  \nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t} & = \vec{\mathbf{0}} \\
  \nabla \cdot \vec{\mathbf{B}} & = 0
\end{align}

Math is beautiful, and it deserves to be presented beautifully.

\LaTeX is essentially a markup language. 
Content is written in plain text and can be annotated with commands that describe how certain elements should be displayed.
And the source document that contains the content is a plain text file
This means I can use `git` to version control the paper.
This allows me to track changes and collaborate with others without any additional effort.
This also lets me work with any editor I want - Vim, Emacs, TeXShop, Lyx.
But most importantly, I have the confidence that my code and documents can survive possibly forever in its current format. \LaTeX is free. Free as in beer and free as in freedom. 

The \LaTeX community is great and are very helpful towards beginners.
There are hundreds of packages that improve upon the functionality that \LaTeX provides.
There are packages like *TikZ* that allow you to create high resolution print quality detailed diagrams.

However, \LaTeX does come with a penalty.
There is a barrier to entry which one must overcome in order to begin using \LaTeX.
Unlike Word, you have to know which commands are used for what markup functionality, not only to know when to use them, but also when not to use them.

Personally, I found learning how to use \LaTeX extremely useful, and I didn't think it was difficult. 
Solutions to my initial problems were only a quick Google search away.
Tables were frustrating at first, but you get the hang of them over time.
Equations are a joy to type in \LaTeX.
And the final product looks great!

That said, the markup language is a bit too heavy for notetaking, and not particularly readable.
Take for example the syntax for a list of items.

    \section{Section Name}
    This is text in the section
    \subsection{Sub Section Name}
    The following is a list in this subsection
    \begin{enumerate}
      \item The first \textbf{bold} item
      \begin{enumerate}
        \item Nested item 1
        \item Nested item 2
      \end{enumerate}
      \item The second \textit{italicized} item
      \item The third etc \ldots
    \end{enumerate}

With good IDE's for \LaTeX this could be made acceptable since they may not hinder the writing process. 
The biggest problem with \LaTeX are probably the error messages.
Most of the time they are near useless, and sometimes they are even borderline cryptic.
Since it has a heavy markup, I like to compile while writing and read from the compiled version to get a sense of context.
With practice and experience one can figure out ways to work with \LaTeX but beginners will still have a hard time.

Once you invest the time to learn \LaTeX I can't think of any reason why one would go back to Word. 
However, if you cannot afford to experiment with \LaTeX are you resigned to Word?
Markdown to the rescue!
    
## Markdown

Markdown is a very lightweight easy-to-read easy-to-write plain text markup language. 
The same example as before looks like this in Markdown.

    # Section Name
    
    This is text in the section
    
    ## Sub Section Name

    The following is a list in this subsection

    * The first **bold** item
        - Nested item 1
        - Nested item 2
    * The second *italicized* item
    * The third etc ...

Much better! It's a lot easier to read and a lot easier to write.
Markdown, developed by John Gruber, was principally written for the web, to avoid the heavy markup of HTML.
Tools have been developed to convert Markdown to HTML, PDF and even docx.

The main advantages of Markdown:

* Easy: the syntax is simple
* Fast: the simple formatting saves time and speeds up workflows of writers
* Portable: documents are cross-platform by nature
* Flexible: html, pdf, docx, tex are all supported output formats

Markdown is awesome at a set of things, and a much better alternative than Word or \LaTeX for those specific set of things.

      Right     Left     Center     Default
    -------     ------ ----------   -------
         12     12        12            12
        123     123       123          123
          1     1          1             1

    Table:  Demonstration of simple table syntax.

This is what the same table looks like in \LaTeX

    \begin{longtable}[c]{@{}rlcl@{}}
    \caption{Demonstration of simple table syntax.}\tabularnewline
    \toprule
    Right & Left & Center & Default\tabularnewline
    \midrule
    \endfirsthead
    \toprule
    Right & Left & Center & Default\tabularnewline
    \midrule
    \endhead
    12 & 12 & 12 & 12\tabularnewline
    123 & 123 & 123 & 123\tabularnewline
    1 & 1 & 1 & 1\tabularnewline
    \bottomrule
    \end{longtable}

However, Markdown does not allow for the level of detailed customization that you can achieve using \LaTeX
Even a moderately complex table such as the one below currently is not supported by any converter for Markdown.

![Tabular LaTeX example [@_wikibooks]](images/table.png)

Fortunately there is a solution for this, but before that we need to take a look at how to convert Markdown to the various document formats.

# Pandoc - A swiss army knife

Pandoc is a software tool written in Haskell that can convert a document from just about any format to just about any other format, and works really well.

Input formats :

* native (native Haskell),
* json (JSON version of native AST),
* markdown (pandoc’s extended Markdown),
* markdown_strict (original unextended Markdown),
* markdown_phpextra (PHP Markdown Extra),
* markdown_github (GitHub-Flavored Markdown),
* commonmark (CommonMark Markdown),
* textile (Textile),
* rst (reStructuredText),
* html (HTML),
* docbook (DocBook),
* t2t (txt2tags),
* docx (docx),
* odt (ODT),
* epub (EPUB),
* opml (OPML),
* org (Emacs Org mode),
* mediawiki (MediaWiki markup),
* twiki (TWiki markup),
* haddock (Haddock markup),
* or latex (LaTeX).

Output formats :

* native (native Haskell),
* json (JSON version of native AST),
* plain (plain text),
* markdown (pandoc’s extended Markdown),
* markdown_strict (original unextended Markdown),
* markdown_phpextra (PHP Markdown Extra),
* markdown_github (GitHub-Flavored Markdown),
* commonmark (CommonMark Markdown),
* rst (reStructuredText),
* html (XHTML),
* html5 (HTML5),
* latex (LaTeX),
* beamer (LaTeX beamer slide show),
* context (ConTeXt),
* man (groff man),
* mediawiki (MediaWiki markup),
* dokuwiki (DokuWiki markup),
* textile (Textile),
* org (Emacs Org mode),
* texinfo (GNU Texinfo),
* opml (OPML),
* docbook (DocBook),
* opendocument (OpenDocument),
* odt (OpenOffice text document),
* docx (Word docx),
* haddock (Haddock markup),
* rtf (rich text format),
* epub (EPUB v2 book),
* epub3 (EPUB v3),
* fb2 (FictionBook2 e-book),
* asciidoc (AsciiDoc),
* icml (InDesign ICML),
* slidy (Slidy HTML and javascript slide show),
* slideous (Slideous HTML and javascript slide show),
* dzslides (DZSlides HTML5 + javascript slide show),
* revealjs (reveal.js HTML5 + javascript slide show),
* s5 (S5 HTML and javascript slide show), 

With 21 input formats and 37 output formats, it doesn't take long to guess that there's no way they implemented a converter for each input to output format.
Pandoc employs a Abstract Syntax Tree (AST) structure as an intermediate stage to convert from one format to another. (This will be important when we talk about filters.)
The point here is that because of this pandoc is great at converting from and to a wide variety of formats.
Pandoc is also constantly under development which is a great thing.

We can use Pandoc to convert a markdown file with content, to a pdf, html or docx file for a technical paper.
(The docx converter doesn't work great though, blame Microsoft's lack of documentation [@_googlegroups])

First off, you will need `pandoc`. You can get the latest version on their GitHub page [@_github]. 
You may need `pandoc-citeproc` as well [^2].
You will also need \LaTeX

I've found that the following python packages are useful.

- `pandoc-attributes`
- `pandoc-eqnos`
- `pandoc-fignos`
- `pandoc-tablenos`
- `pandocfilters`

You can run `pip install <package-name>`. 
Alternatively you can create a virtual environment using `conda` with a suitable environment file [@krishnamurthy_github], which is the approach I recommend [@krishnamurthy_using].

There are several people that have shared their complete workflow along with all their resources [@healy_plain]. 
Mine is available on GitHub [@krishnamurthy_github] as well.
While someone else's workflow will work for you, I highly recommend doing it from scratch and crafting your own Makefile. 
That way you will figure out why each item has been added into that workflow, and if (when?) it breaks you will be able to figure out why.
I also highly recommend going through other people's Makefiles to see what they have done.
That way you might be able to see an implementation that works better than your own.

## Syntax

### ***Headings***

    # Section
    ## Sub Section
    ### Sub Sub Section

### ***Text***

    This text is in *italic*. 
    This text is in **bold**. 
    And this text is in ***bold-italic***

This text is in *italic*. 
This text is in **bold**. 
And this text is in ***bold-italic***.

### ***Link***
    
    [Text](http://google.com)

[Text](http://google.com)

### ***Images***
    
    [Caption](images/markdown.png)

![Caption](images/markdown.png)

### ***Lists***

    * item
    * item
        * item
    * item

    1. item
    1. item
        1. item
    1. item

* item
* item
    * item
* item

1. item
1. item
    1. item
1. item

### ***Quotes***

    > Research is what I'm doing 
    when I don't know what I'm doing.
    - Wernher von Braun

> Research is what I'm doing 
when I don't know what I'm doing. 
- Wernher von Braun

### ***Code***
    
    `inline code`

        Tab space 
        for code block

`inline code`

    Tab space 
    for code block

### ***Tables***

      Right     Left     Center     Default
    -------     ------ ----------   -------
         12     12        12            12
        123     123       123          123
          1     1          1             1

    Table:  Demonstration of simple table syntax.

  Right     Left     Center     Default
-------     ------ ----------   -------
     12     12        12            12
    123     123       123          123
      1     1          1             1

Table:  Demonstration of simple table syntax.

### ***Footnotes***

    Example of a footnote [^3]

Example of a footnote [^3]

### ***Citations***

    This is a very important fact [@citation_example]

This is a very important fact [@citation_example]


### ***Strikethrough***

    ~~Strikethrough text~~

~~Strikethrough text~~

### ***Equations***

    Inline equations $\pi$

    Block equations 

    $$
    \pi
    $$

Inline equations $\pi$

Block equations 

$$
\pi
$$

## Pandoc conversion

Once you have typed all the content, you can use `pandoc` to convert the document into the format you want.
Pandoc uses the output filename extension to figure out what the output file format should be.
Btw, Pandoc is a command line tool only. 
So you will have to use the command line for any conversion.

    pandoc document.md -o document.pdf

I highly recommend reading pandoc's README [@_pandoc]. 
It has loads of examples and you might be able to find what you are looking for by straight up picking an example or by making a minor tweak to it.

With pdf files, you can specify the following

* `--latex-engine=pdflatex` : latex engine
* `--latex-template=latex.template` : latex template file

With html files, you can specify the following

* `--template=html.template` : html template file
* `--css=cssfile.css` : css file

With docx files unfortunately, you cannot specify a template (at the time of writing this post).
You can however, specify a reference-docx, which might do the job

* `--reference-docx=reference.docx` : docx for reference styles

These are additional arguments that allow you to use citations when writing academic papers.

* `--filter pandoc-citeproc` : filter to parse citations
* `--csl=CSLFILE` : define a citation style sheet e.g. ieee.csl
* `--bibliography=BIBFILE` : look for citations from a bibliography

`pandoc` will find the appropriate citation from a .bib file and add it to your Bibliography according to the style sheet you specify. 
It works great and I've had no issues with it so far.

Also, I've found the following filters useful.

* `--filter pandoc-eqnos` : equation numbers
* `--filter pandoc-fignos` : figure numbers
* `--filter pandoc-tablenos` : table numbers

As you can see, there are a lot of arguments that can be passed to Pandoc.
I've found using Makefiles for recording your past commands and documenting these instructions extremely useful.

# Cons to using Markdown?

pandoc allows you to define \LaTeX blocks in a markdown file, which are passed straight through to \LaTeX without any change. 
\LaTeX then processes it and renders it correctly.
Which means if you want to generate a pdf, you are in luck!
You have the entire arsenal of \LaTeX commands at your disposal.

When converting to html or docx files however, pandoc will just choose to remove \LaTeX blocks.
There is a workaround for equations.
With HTML, you can specify `--mathjax` which will attempt to render \LaTeX as mathjax, which works most of the time. 
This webpage for example was generated entirely from a markdown file, rendered to html using pandoc.
I have found a few cases where mathjax did not work correctly for me though. 
So there may be some experimenting involved.
With docx, pandoc will (currently) convert to mathjax as well, and this seems to work only a certain set of the markdown equation syntax that pandoc supports.
With tables it is Markdown or bust.
You have to format it in the Markdown table format that pandoc supports.

The good news is that anything you do in \LaTeX, you can do in Markdown and render as a pdf.
This includes equations, tables, citations, images, lists, tikz diagrams etc.
The bad news is that if you do decide to use \LaTeX syntax, you are still writing \LaTeX (although a lot less of it), and you have lost complete html and docx conversion capability.
Also, Markdown / Pandoc currently does not support spliting the source document across multiple files.
This was not as much a deal breaker for me as I thought.
I've not found this a concern since the markup is pretty light.
However, for large reports spanning hundreds of pages this may be a issue.
There are workarounds for this, however they are not perfectly clean.

# Bending Markdown

Fortunately, the problems I mentioned in the previous section can be solved using an excellent feature of pandoc.
Remember the filter argument for pandoc?
You can use it to parse certain blocks in a custom fashion.
For most people this is not necessary, but if you come across a case where pandoc does not do what you want it to do, you can write a filter for it.
There is even a python package called pandocfilters that allows you to walk the AST and parse specific formats or keys. 
It is very powerful, and can offer unique ways to expand on pandoc's functionality.
I wrote a pandocfilter [@krishnamurthy_github-1] to embed a jupyter notebook using a liquid tag style syntax, which I currently use for this blog.

In theory, you can write a filter that finds a \LaTeX table block in Markdown, converts it to an image and renders that in Word.
Or you can write a filter that inputs other files during run time, allowing you to split your source document.

My understanding is that the Python pandocfilters package is limited in scope. 
You can yield Pandoc's complete power by writing a Haskell filter instead of using Python, but then you will be writing Haskell ;)
I would tag custom filters that as an advanced feature.
Know that they are there when you need them.

# TLDR

You can write a complete paper in Markdown and render it in pdf without any issues.
I recommend it over \LaTeX and Word.

![My very scientific comparison of Word, \LaTeX and Markdown](images/learningcurve.png)

If you have gotten this far in the post, congratulations and good luck! 
Let me know if you have any questions in the comments below.

# References

<div id="refs" class="references">
</div>

[^1]: I understand that there are *correct* ways to go about this, but I don't want to be thinking about that while I'm writing.
[^2]: If you install Pandoc from a package, pandoc-citeproc should come preinstalled. However, if you use a package manager such as `brew` (`brew install pandoc`), you may need to install `pandoc-citeproc` as well. Just run `brew install pandoc-citeproc`.
[^3]: Footnote! If you are viewing the web version, you can continue reading by clicking here ->
