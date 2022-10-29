# SCRHUDA

Sistema colaborativo para la redaccion de historias de usuario guiado por diagrama de actividades. Utiliza el motor backend de Convergence, que corre en un contenedor Docker y la vista de MxGraph desplegado con el sistema de paquetes npm de Node.js.
<p float="center">
  <img src="https://convergence.io/assets/img/convergence-logo.png" height="75"/>
  <img src="https://jgraph.github.io/mxgraph/docs/images/mxgraph_logo.gif"height="75"/>
</p>

La vista de MxGraph ha sido modificada para entregar el ambiente adecuado a la construcción de diagrama de actividades y la redacción de historias de usuario.

## Dependencias

- npm >= 7.0
- node >= 14.0
- mxGraph >= 4.2
- convergence >= 1.0.0-rc.11

## Ejecutar la webapp

### Para la vista (mxgraph/)
- ejecutar el comando `npm install`
- Configurar la dirección del contenedor Convergence en `mxgraph.config.js`
- ejecutar el comando `npm start`

### Para el motor Convergence
- Ejecutar el contenedor Docker del Convergence omnibus con el comando 
 `docker run --nameConvergence" -p "8000:80" convergencelabs/convergence-omnibus`
 
## Resultado
- Abrir en la dirección que entregue la consola, puede ser `http://localhost` más algun puerto
![imagen](https://user-images.githubusercontent.com/54908517/198812607-e6c184e7-24a2-4b65-820d-910531df44e4.png)

## Colores
- #2f5bb7
- #ff752b
- #000000
