title:Writing Technical Papers with Markdown
date:Sun Dec 20 17:37:56 MST 2015
tags:markdown, writing
summary: Use Markdown for Academic writing
keywords:markdown, vim, writing, academic, scholarly, scientific, papers
slug:writing-papers-with-markdown
category:blog 
alias:/blog/writing-papers-with-markdown
status:draft

Recently, I’ve had several people ask me about the Markdown workflow I use to write papers. 
There's an excellent write up about this Kieren Healy's blog [@healy_plain] where he also provides all his resources.

# Why Markdown

Academic writing involves writing down ideas as they come along (notetaking), experimenting with these ideas (data analysis), and finally presenting these ideas (scientific paper).
There's a lot to manage over the length of time spanning this entire process.
Academics require a set of tools that aid in making this process seamless and as little in the way as possible.
Currently, there are two options for academics seeking to write technical papers - Microsoft Word or $\LaTeX$.

## A word about Word 

Microsoft Word is ubiquitous when it comes to writing reports. 
The great thing about Word is that there is almost no barrier to *begin* writing.
You can incrementally build your skill set in Word.
This is great since it makes it immediately accessible, thereby decreasing the time spent on what tool were involved for writing and allowing you to concentrate on the writing itself.

However, I've found a few fundamental problems with Word. 

Having a WYSIWYG (What You See Is What You Get) editor is great, even Richard Stallman seems to think so [@stallman_emacs].
However, products like Word fail miserably at separating content from formatting.
These products impose on the writer their own concept of how a document should be formatted, which I've often found hinders the writing process.
The sudden jump in spacing, the mismatched formatting after a paste function, the battle between indent and bullet points are all typesetting processes that distract from the task at hand [^1].
Formatting should be applied **after** the text is completed.

Microsoft's ecosystem comes at a price, literally.
Word is proprietary, and Word's format is a proprietary data format.
When you use Word, you make the implicit assumption that everyone you work with has the same software on their computer. 
Word does not play well with its counterparts on OSX. 
As far as I know there isn't even a version on Linux. 
Heck, Microsoft Word does not even play well with previous versions of Microsoft Word.
I understand that backward incompatible software changes were probably inevitable, but as an user this adds one more thing to what I have to be concerned about.
I don't want to think about what software my reviewers are using when I'm sending them a document.
Moreover, by storing your work in this proprietary software's proprietary format, you are essentially tying yourself down to their licensed software in the future.
And don't even get me started on viruses, some of which as of this writing do not have patches [@beaumont_bypass_2015].
People have already talked about this at length [@steingold_proprietary, @cottrell_word], and have probably done more justice to this topic that I possibly could.

I hear what you are saying, you have already invested in Microsoft Word and have prescient knowledge around the mysterious formatting randomness.
You use a Windows machine, and everyone around you uses one as well.
You don't really care if the software you use is proprietary, as long as you can get the job done and you are pretty careful about what links you click. I still think there is a case to be made about why you may not consider Word for your next paper.

* Word is slow, and consumes sometimes up to a gig of virtual memory. For what is basically a word processor, that is unnecessary.
* There is no good way to permanently save comments or notes in Word, that persist in the final version without affecting the final document.
* Collaborating with other people when using Word requires foresight and planning. 
* The equation editor painful to use.
* Technical papers or reports that involve data analysis contain figures that are generated or tables that are populated using scripts.

## $\LaTeX$ - lah-tekh, lah-tek or lay-tek

$\LaTeX$ is a typesetting system that uses the TeX program and is frequently used in scientific, technical and mathematical papers.
It is infamous for displaying equations in a manner that looks great.

$$
\begin{align}
& \hskip5em & ∇ × \mathcal H & = \frac{\partial{\mathcal D}}{\partial{t}} & \hskip5em \\
& & -∇ × \mathcal E & = \frac{\partial{\mathcal B}}{\partial{t}} & \\
& & ∇ · \mathcal B & =0 & & \\
& & ∇ · \mathcal D & =0 & &
\end{align}
$$

Math is beautiful and deserves to be presented beautifully.

$\LaTeX$ solves all the gripes I had with Word. 
I can work with any editor I want - Vim, Emacs, TeXShop, Lyx.
$\LaTeX$ has an great community who are helpful to beginners.
There are hundreds of packages that improve upon the functionality that $\LaTeX$ provides.
Packages like TikZ allow you to create high resolution detailed flowcharts.
And equations look great. 
And since the source document that contains the content is a text file, I can use `git` to version control my paper.
This allows me to track changes and collaborate with others without any additional effort.
But most importantly, I have the confidence that my code and documents can survive possibly for ever.

However, $\LaTeX$ does come with a penalty.
There is a barrier to entry which one must overcome in order to begin using $\LaTeX$.


# Tools required

First off, you will need pandoc. You can get the latest version on their GitHub page [@_github].
You will also need $\LaTeX$.

The following python packages are useful.

- pandoc-attributes
- pandoc-eqnos
- pandoc-fignos
- pandoc-tablenos
- pandocfilters

You can run `pip install <package-name>`. 
Alternatively you can create a virtual environment using `conda` with a suitable environment file [@krishnamurthy_github], which is the approach I recommend [@krishnamurthy_using].

# References

[^1]: I understand that there are *correct* ways to go about this, but I don't want to be thinking about that while I'm writing.
