# SCRHUDA

Sistema colaborativo para la redaccion de historias de usuario guiado por diagrama de actividades. Utiliza el motor backend de Convergence, que corre en un contenedor Docker y la vista de MxGraph desplegado con el sistema de paquetes npm de Node.js.
<p float="center">
  <img src="https://convergence.io/assets/img/convergence-logo.png" height="75"/>
  <img src="https://upload.wikimedia.org/wikipedia/commons/3/3e/Diagrams.net_Logo.svg"height="75"/>
</p>

La vista de MxGraph ha sido modificada para entregar el ambiente adecuado a la construcción de diagrama de actividades y la redacción de historias de usuario.

## Dependencias

- npm >= 7.0
- node >= 14.0
- mxGraph >= 4.2
- convergence >= 1.0.0-rc.11

## Ejecutar la webapp

### Para la vista
- ejecutar el comando `npm install`
- Configurar la dirección del contenedor Convergence en `mxgraph.config.js`
- ejecutar el comando `npm start`

### Para el motor Convergence
- Ejecutar el contenedor Docker del Convergence omnibus con el comando 
 `docker run --nameConvergence" -p "8000:80" convergencelabs/convergence-omnibus`
 - Abrir en `http://localhost`

## Resultado
![imagen](https://user-images.githubusercontent.com/54908517/170595323-92e3cb21-f943-48d6-92cf-b7ed2cf21071.png)

## Colores
- #2f5bb7
- #ff752b
- #000000
