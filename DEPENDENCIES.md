<div align="center">

# Project Dependencies
</div>

This project was developed within a **[Anaconda Distribution](https://www.anaconda.com/)** virtual environment capable of withstanding the ``Web Application``. If you are interested in recreating the conditions of the environment, make sure to **follow the next few steps** on how to propely set it up.

## Virtual Environment

Firstly, let's start by **creating the NodeJS conda virtual environment**:

    conda env create -f NodeJS.yml

**Activate** the new environment:

    conda activate NodeJS

For the next command make sure to be inside the ``Server Client Multiplayer Game Folder`` to therefore install some other packages via ``npm`` [**Node Package Manager**].

    cd ./"Server Client Multiplayer Game"

## Additional Packages Installation

To install ``express`` execute:

    npm install express@4.18.2 --save-exact
    
To install ``nodemon`` globally, which **automatically refreshes the web page** every time the source code is **changed**, make sure to use:

    npm install -g nodemon@3.1.4


<div align="right">
<sub>
<!-- <sup></sup> -->

`DEPENDENCIES.md by Gonçalo Esteves`
</sub>
</div>