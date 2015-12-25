title:Using conda to manage packages
date:Fri Dec 25 04:32:51 MST 2015
tags:python
summary:Use conda env to manage packages
keywords:python, acaconda
slug:using-conda-to-manage-packages
category:blog 
alias:/blog/using-conda-to-manage-packages

# Why Anaconda

# How to

First specifying a `environment.yml` file

    # environment.yml
    name: psst-env
    dependencies:
    - python
    - nose
    - numpy
    - pandas
    - pip
    - pip:
        - pyomo

Create the environment by 

    conda env create

You can update the environment after adding a package to `environment.yml` by using the following

    conda env update

Activate the environment by using the following.

    source activate psst-env 

# References

