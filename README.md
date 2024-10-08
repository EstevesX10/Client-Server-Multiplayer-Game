<p>
<div align="center">

# Client-Server Multiplayer Game
</div>
</p>

<p align="center" width="100%">
    <img src="./Client-Server Multiplayer Game/Assets/ClientServerModel.png" width="60%" height="60%" />
</p>

<div align="center">
    <a>
        <img src="https://img.shields.io/badge/Made%20with-JavaScript-A2CEFF?style=for-the-badge&logo=javascript&logoColor=A2CEFF">
    </a>
    <a>
        <img src="https://img.shields.io/badge/Made%20with-Socket.io-A2CEFF?style=for-the-badge&logo=socketdotio&logoColor=A2CEFF">
    </a>
    <a>
        <img src="https://img.shields.io/badge/Made%20with-Node.js-A2CEFF?style=for-the-badge&logo=node.js&logoColor=A2CEFF">
    </a>
</div>

<br/>

<div align="center">
    <a href="https://github.com/EstevesX10/Client-Server-Multiplayer-Game/blob/main/LICENSE">
        <img src="https://img.shields.io/github/license/EstevesX10/Client-Server-Multiplayer-Game?style=flat&logo=gitbook&logoColor=A2CEFF&label=License&color=A2CEFF">
    </a>
    <a href="">
        <img src="https://img.shields.io/github/repo-size/EstevesX10/Client-Server-Multiplayer-Game?style=flat&logo=googlecloudstorage&logoColor=A2CEFF&logoSize=auto&label=Repository%20Size&color=A2CEFF">
    </a>
    <a href="">
        <img src="https://img.shields.io/github/stars/EstevesX10/Client-Server-Multiplayer-Game?style=flat&logo=adafruit&logoColor=A2CEFF&logoSize=auto&label=Stars&color=A2CEFF">
    </a>
    <a href="https://github.com/EstevesX10/Client-Server-Multiplayer-Game/blob/main/DEPENDENCIES.md">
        <img src="https://img.shields.io/badge/Dependencies-DEPENDENCIES.md-A2CEFF?style=flat&logo=anaconda&logoColor=A2CEFF&logoSize=auto&color=A2CEFF">
    </a>
</div>

## Project Overview

This project composes of a **client-server based multiplayer game** where players control ``spaceships`` in a shared universe, engaging in **real-time battles**. The ``goal`` was to create an immersive and competitive environment where ``multiple players`` can **connect**, **control their ships**, as well as partake in strategic **space combat**.

It focuses on both ``frontend`` and ``backend`` **development**, with special emphasis on **efficient communication between clients and the server**, ensuring a seamless gaming experience for all players.

## Client-Server Model

### Description
The ``Client-Server Model`` is composed by:

- A **Client** -> Sends a request to a server over a network
- A **Server** -> Processes the clients request and sends back a response 

This model forms the ``foundation of cloud computing`` and allows developers to scale infrastructure up or down with **minimal downtime**, as well as deploy applications closer to **end users**.

### How it Works

A ``client`` is an **application that runs on a device** (such as a laptop or smartphone), while a ``server`` is a device that **provides services to the client**.

The client and server **communicate over** a ``network``, where the **client sends requests** for data or services to the **server**, which processes these requests and then **returns the requested data or services** to the client.

The ``client/server model`` is used to access **cloud services**, such as **computing power**, **storage**, and **applications**. ``Clients`` can range from **web browsers** to **mobile apps**, and ``servers`` can include **virtual machines**, **containers**, or **serverless functions**.

<p align="center" width="100%">
    <img src="./Client-Server Multiplayer Game/Assets/ClientServerModelArchitecture.png" width="50%" height="50%" />
</p>

### Limitations

While this model has **many benefits**, it presents some ``limitations`` that can affect its **performance**, particularly during ``high traffic`` or demand periods.

One of the most **significant limitations of the client/server model** is that a server can get **overloaded with requests** from clients, which can cause the server to **slow down or even crash**, resulting in ``downtime or errors``. 

## Project Dependencies

Before proceeding with the ``projects execution``, ensure that you thoroughly review the [Dependencies file](https://github.com/EstevesX10/Client-Server-Multiplayer-Game/blob/main/DEPENDENCIES.md). It provides a **comprehensive description** of the ``Anaconda environment``, including all required **packages** and their specific **versions**. 

Moreover, some external dependencies were properly **detailed** within this file, so it's important to **follow the setup steps** carefully.

## Project Execution

To **start the Web Application** and interact with the project, make sure to execute:

    nodemon backend.js

And access the [Localhost](http://localhost:3000/) on port 3000.

## Project Demo

### Home Page

Here's a quick look on how the Home Page of the Web Application looks like.

<p align="center" width="100%">
    <img src="./Client-Server Multiplayer Game/Assets/HomePageShowcase.gif" width="100%" height="100%" />
</p>

### Game Interface

Here are ``two brief gameplay samples`` showcasing how the interface functions with **two players in the game environment**.

#### Enemy Gameplay

This next video demonstrates how the ``movements`` and ``projectiles`` of **enemy players** are **updated on the game board** across **other players' devices**, highlighting the game's ``multiplayer features``.

<div align = "center">
 <video src= "https://github.com/user-attachments/assets/1f27cc8d-9ddc-487c-89fb-1760d3ff9bca" />
</div>

#### Player Gameplay

Additionally, this sample provides an **enhanced view of the game board** and all the players on it, along with a ``leaderboard`` that **updates in real-time** as players eliminate opponents, reflecting their **current scores**.

<div align = "center">
 <video src= "https://github.com/user-attachments/assets/34055293-f827-4a97-8290-40a095dfe493" />
</div>

<div align="right">
<sub>
<!-- <sup></sup> -->

`README.md by Gonçalo Esteves`
</sub>
</div>
