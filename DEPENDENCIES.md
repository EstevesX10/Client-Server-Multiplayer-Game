<div align="center">

# Project Dependencies
</div>

This project was developed within a **[Anaconda Distribution](https://www.anaconda.com/)** virtual environment capable of withstanding the ``Web Application``. If you are interested in recreating the conditions of the environment, make sure to **follow the next few steps** on how to propely set it up.

## Virtual Environment

Firstly, let's start by **creating the NodeJS conda virtual environment**:

    conda env create -f NodeJS.yml

**Activate** the new environment:

    conda activate NodeJS

For the next command make sure to be inside the ``Client-Server Multiplayer Game Folder`` to therefore install some other packages via ``npm`` [**Node Package Manager**].

    cd ./"Server Client Multiplayer Game"

## Additional Packages Installation

To install ``express`` execute:

    npm install express@4.19.2 --save-exact
    
To install ``nodemon`` globally, which **automatically refreshes the web page** every time the source code is **changed**, make sure to use:

    npm install -g nodemon@3.1.4


To install socket.io, which allows us to connect to the backend server and then broadcast events to anyone connected to it, you can use:

    npm install socket.io@4.7.5 --save-exact

This package helps to track the position of multiple players within each individual screen. Instead of creating a player based on a frontend file, we aim to create multiple players based on the server events.

<div align="right">
<sub>
<!-- <sup></sup> -->

`DEPENDENCIES.md by Gonçalo Esteves`
</sub>
</div>