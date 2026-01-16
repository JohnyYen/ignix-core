- Biblioteca de implementaciones genericas que puede servir para cualquier proyecto sobretodo para mis proyectos de desarrollo
- Minimo servicios, repositorios genericos e implementacion del patron result de forma ingenieril
- Despues crecer a controllers, endpoints, CQRS, entre otras, para generalizar todo lo equivalente a logica de negocio, crud por asi decirlo con buenas practicas.
- Se debe implementar con la menor cantidad posible de dependencias para que sea algo ligero

## Primera Fase

- Implementar las abstracciones necesarias para los servicios (interfaces y abstract class)
- Implementar la fabrica singleton de clases result 
- Implementar un repositorio agnostico al ORM
- Enlazar el repositorio con los servicios
