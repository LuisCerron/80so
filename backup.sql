-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: db_estacionamiento_utp2
-- ------------------------------------------------------
-- Server version	8.0.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accesos`
--

DROP TABLE IF EXISTS `accesos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accesos` (
  `id_acceso` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_vehiculo` int NOT NULL,
  `id_espacio` int NOT NULL,
  `tipo_acceso` enum('entrada') COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_hora` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `metodo_identificacion` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_acceso`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_vehiculo` (`id_vehiculo`),
  KEY `id_espacio` (`id_espacio`),
  CONSTRAINT `accesos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `accesos_ibfk_2` FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculos` (`id_vehiculo`),
  CONSTRAINT `accesos_ibfk_3` FOREIGN KEY (`id_espacio`) REFERENCES `espacios` (`id_espacio`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro histórico de ingresos y salidas del estacionamiento.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accesos`
--

LOCK TABLES `accesos` WRITE;
/*!40000 ALTER TABLE `accesos` DISABLE KEYS */;
INSERT INTO `accesos` VALUES (3,4,4,60,'entrada','2025-06-23 07:08:51','Manual'),(4,13,13,35,'entrada','2025-06-23 07:08:51','QR'),(9,1,1,6,'entrada','2025-07-30 00:11:30','Reserva Verificada'),(10,1,1,14,'entrada','2025-08-19 20:33:24','Reserva Verificada');
/*!40000 ALTER TABLE `accesos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `espacios`
--

DROP TABLE IF EXISTS `espacios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `espacios` (
  `id_espacio` int NOT NULL AUTO_INCREMENT,
  `ubicacion` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Ej: A-01, AM-01, AD-01',
  `estado` enum('disponible','ocupado','mantenimiento','reservado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'disponible',
  `tipo_espacio` enum('Normal','Discapacitado','Eléctrico','Moto') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Normal',
  `fecha_hora_ocupacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_espacio`),
  UNIQUE KEY `ubicacion` (`ubicacion`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla que define los espacios físicos del estacionamiento.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `espacios`
--

LOCK TABLES `espacios` WRITE;
/*!40000 ALTER TABLE `espacios` DISABLE KEYS */;
INSERT INTO `espacios` VALUES (1,'A-01','reservado','Normal','2025-08-19 15:32:36'),(2,'A-02','disponible','Normal',NULL),(3,'A-03','disponible','Normal',NULL),(4,'A-04','reservado','Normal','2025-07-16 16:36:25'),(5,'A-05','ocupado','Eléctrico','2025-06-23 02:08:51'),(6,'A-06','ocupado','Normal','2025-07-16 16:26:39'),(7,'A-07','reservado','Normal','2025-08-19 15:32:11'),(8,'A-08','reservado','Normal','2025-06-24 19:34:19'),(9,'A-09','disponible','Normal',NULL),(10,'A-10','disponible','Normal',NULL),(11,'A-11','disponible','Normal',NULL),(12,'A-12','disponible','Normal',NULL),(13,'A-13','disponible','Normal',NULL),(14,'A-14','ocupado','Normal','2025-07-29 19:11:15'),(15,'A-15','reservado','Normal','2025-07-22 21:00:22'),(16,'A-16','disponible','Normal',NULL),(17,'A-17','disponible','Normal',NULL),(18,'A-18','disponible','Normal',NULL),(19,'A-19','disponible','Normal',NULL),(20,'A-20','disponible','Normal',NULL),(21,'A-21','disponible','Normal',NULL),(22,'A-22','disponible','Normal',NULL),(23,'A-23','disponible','Normal',NULL),(24,'A-24','disponible','Normal',NULL),(25,'A-25','disponible','Normal',NULL),(26,'A-26','disponible','Normal',NULL),(27,'A-27','reservado','Normal','2025-08-19 15:32:30'),(28,'A-28','reservado','Normal','2025-07-01 20:29:31'),(29,'A-29','disponible','Normal',NULL),(30,'A-30','disponible','Normal',NULL),(31,'AM-01','disponible','Moto',NULL),(32,'AM-02','disponible','Moto',NULL),(33,'AM-03','disponible','Moto',NULL),(34,'AM-04','disponible','Moto',NULL),(35,'AM-05','ocupado','Moto','2025-06-23 02:08:51'),(36,'AM-06','disponible','Moto',NULL),(37,'AM-07','disponible','Moto',NULL),(38,'AM-08','disponible','Moto',NULL),(39,'AM-09','disponible','Moto',NULL),(40,'AM-10','disponible','Moto',NULL),(41,'AM-11','disponible','Moto',NULL),(42,'AM-12','disponible','Moto',NULL),(43,'AM-13','disponible','Moto',NULL),(44,'AM-14','disponible','Moto',NULL),(45,'AM-15','disponible','Moto',NULL),(46,'AM-16','disponible','Moto',NULL),(47,'AD-01','ocupado','Discapacitado','2025-06-23 02:08:51'),(48,'AD-02','reservado','Discapacitado','2025-08-19 15:32:44'),(49,'AD-03','disponible','Discapacitado',NULL),(50,'AD-04','disponible','Discapacitado',NULL),(51,'B-01','ocupado','Normal','2025-06-23 02:08:51'),(52,'B-02','disponible','Normal',NULL),(53,'B-03','disponible','Normal',NULL),(54,'B-04','disponible','Normal',NULL),(55,'B-05','disponible','Eléctrico',NULL),(56,'B-06','reservado','Normal','2025-06-24 19:33:06'),(57,'B-07','disponible','Normal',NULL),(58,'B-08','disponible','Normal',NULL),(59,'B-09','disponible','Normal',NULL),(60,'B-10','ocupado','Normal','2025-06-23 02:08:51'),(61,'B-11','disponible','Normal',NULL),(62,'B-12','disponible','Normal',NULL),(63,'B-13','disponible','Normal',NULL),(64,'B-14','disponible','Normal',NULL),(65,'B-15','disponible','Normal',NULL),(66,'B-16','disponible','Normal',NULL),(67,'B-17','disponible','Normal',NULL),(68,'B-18','disponible','Normal',NULL),(69,'B-19','disponible','Normal',NULL),(70,'B-20','disponible','Normal',NULL),(71,'B-21','disponible','Normal',NULL),(72,'B-22','disponible','Normal',NULL),(73,'B-23','disponible','Normal',NULL),(74,'B-24','disponible','Normal',NULL),(75,'B-25','disponible','Normal',NULL),(76,'B-26','disponible','Normal',NULL),(77,'B-27','disponible','Normal',NULL),(78,'B-28','disponible','Normal',NULL),(79,'B-29','disponible','Normal',NULL),(80,'B-30','disponible','Normal',NULL),(81,'BM-01','disponible','Moto',NULL),(82,'BM-02','disponible','Moto',NULL),(83,'BM-03','disponible','Moto',NULL),(84,'BM-04','disponible','Moto',NULL),(85,'BM-05','disponible','Moto',NULL),(86,'BM-06','disponible','Moto',NULL),(87,'BM-07','disponible','Moto',NULL),(88,'BM-08','disponible','Moto',NULL),(89,'BM-09','disponible','Moto',NULL),(90,'BM-10','disponible','Moto',NULL),(91,'BM-11','disponible','Moto',NULL),(92,'BM-12','disponible','Moto',NULL),(93,'BM-13','disponible','Moto',NULL),(94,'BM-14','disponible','Moto',NULL),(95,'BM-15','disponible','Moto',NULL),(96,'BM-16','disponible','Moto',NULL),(97,'BD-01','disponible','Discapacitado',NULL),(98,'BD-02','disponible','Discapacitado',NULL),(99,'BD-03','disponible','Discapacitado',NULL),(100,'BD-04','disponible','Discapacitado',NULL);
/*!40000 ALTER TABLE `espacios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permisos`
--

DROP TABLE IF EXISTS `permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permisos` (
  `id_permiso` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_vehiculo` int NOT NULL,
  `id_espacio` int NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `estado_permiso` enum('activo','inactivo','caducado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activo',
  PRIMARY KEY (`id_permiso`),
  UNIQUE KEY `id_espacio` (`id_espacio`,`estado_permiso`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_vehiculo` (`id_vehiculo`),
  CONSTRAINT `permisos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `permisos_ibfk_2` FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculos` (`id_vehiculo`),
  CONSTRAINT `permisos_ibfk_3` FOREIGN KEY (`id_espacio`) REFERENCES `espacios` (`id_espacio`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Asignación de espacios fijos a usuarios por un período determinado.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permisos`
--

LOCK TABLES `permisos` WRITE;
/*!40000 ALTER TABLE `permisos` DISABLE KEYS */;
INSERT INTO `permisos` VALUES (1,2,2,5,'2024-01-01',NULL,'activo'),(2,3,3,47,'2024-02-01',NULL,'activo'),(3,17,17,51,'2024-03-01',NULL,'activo');
/*!40000 ALTER TABLE `permisos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservas`
--

DROP TABLE IF EXISTS `reservas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservas` (
  `id_reserva` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_vehiculo` int NOT NULL,
  `id_espacio` int NOT NULL,
  `fecha_hora_reserva` datetime NOT NULL,
  `estado_reserva` enum('activa','completada','cancelada') NOT NULL DEFAULT 'activa',
  PRIMARY KEY (`id_reserva`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_vehiculo` (`id_vehiculo`),
  KEY `id_espacio` (`id_espacio`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservas`
--

LOCK TABLES `reservas` WRITE;
/*!40000 ALTER TABLE `reservas` DISABLE KEYS */;
INSERT INTO `reservas` VALUES (1,1,1,3,'2025-07-01 15:18:36','completada'),(2,2,1,24,'2025-07-01 20:14:35','completada'),(3,11,1,28,'2025-07-01 20:29:31','activa'),(4,1,1,43,'2025-07-01 20:36:17','completada'),(5,1,1,6,'2025-07-16 16:26:39','completada'),(6,5,1,4,'2025-07-16 16:36:25','activa'),(7,2,1,15,'2025-07-22 21:00:22','activa'),(8,1,1,14,'2025-07-29 19:11:15','completada'),(9,1,1,7,'2025-08-19 15:32:11','activa'),(10,1,1,27,'2025-08-19 15:32:30','activa'),(11,1,1,1,'2025-08-19 15:32:36','activa'),(12,1,1,48,'2025-08-19 15:32:44','activa');
/*!40000 ALTER TABLE `reservas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo_utp` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dni` varchar(8) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` enum('Estudiante','Docente','Administrativo','Visitante','operador') COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `dni` (`dni`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `codigo_utp` (`codigo_utp`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla para almacenar los datos de los usuarios del estacionamiento.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Ana','García','U18201234','71234567','Estudiante','ana.garcia@utp.edu.pe','987654321',1,'2025-06-23 07:08:51'),(2,'Carlos','Rodriguez','C12345678','45987654','Docente','carlos.rodriguez@utp.edu.pe','912345678',1,'2025-06-23 07:08:51'),(3,'Lucía','Fernández','A98765432','10293847','Administrativo','lucia.fernandez@utp.edu.pe','955555555',1,'2025-06-23 07:08:51'),(4,'Marco','Polo',NULL,'20394857','Visitante','marco.polo@email.com','944444444',1,'2025-06-23 07:08:51'),(5,'Sofia','Vargas','U19304567','30485761','Estudiante','sofia.vargas@utp.edu.pe','933333333',1,'2025-06-23 07:08:51'),(6,'Javier','Masias','C87654321','40576138','Docente','javier.masias@utp.edu.pe','922222222',1,'2025-06-23 07:08:51'),(7,'Valeria','Rojas','U20102345','50613847','Estudiante','valeria.rojas@utp.edu.pe','911111111',1,'2025-06-23 07:08:51'),(8,'Pedro','Gomez','A11223344','60138475','Administrativo','pedro.gomez@utp.edu.pe','900000000',1,'2025-06-23 07:08:51'),(9,'Elena','Torres','U17205678','70384756','Estudiante','elena.torres@utp.edu.pe','988888888',1,'2025-06-23 07:08:51'),(10,'Ricardo','Luna',NULL,'80475613','Visitante','ricardo.luna@email.com','977777777',1,'2025-06-23 07:08:51'),(11,'Camila','Mendoza','U21109876','90561384','Estudiante','camila.mendoza@utp.edu.pe','966666666',1,'2025-06-23 07:08:51'),(12,'Diego','Silva','C33445566','11223344','Docente','diego.silva@utp.edu.pe','954545454',1,'2025-06-23 07:08:51'),(13,'Gabriela','Paredes','U19207890','22334455','Estudiante','gabriela.paredes@utp.edu.pe','943434343',1,'2025-06-23 07:08:51'),(14,'Mateo','Chavez',NULL,'33445566','Visitante','mateo.chavez@email.com','932323232',1,'2025-06-23 07:08:51'),(15,'Isabella','Rios','U20301122','44556677','Estudiante','isabella.rios@utp.edu.pe','921212121',1,'2025-06-23 07:08:51'),(16,'Luis','Ortega','A77889900','55667788','Administrativo','luis.ortega@utp.edu.pe','910101010',1,'2025-06-23 07:08:51'),(17,'Mariana','Cruz','C55667788','66778899','Docente','mariana.cruz@utp.edu.pe','987123456',1,'2025-06-23 07:08:51'),(18,'Andres','Flores','U18304455','77889900','Estudiante','andres.flores@utp.edu.pe','976543210',1,'2025-06-23 07:08:51'),(19,'Paula','Castillo','U22106677','88990011','Estudiante','paula.castillo@utp.edu.pe','965432109',1,'2025-06-23 07:08:51'),(20,'Sebastian','Soto',NULL,'99001122','Visitante','sebastian.soto@email.com','954321098',1,'2025-06-23 07:08:51'),(21,'Daniela','Quispe','U23101234','12121212','Estudiante','daniela.quispe@utp.edu.pe','943210987',1,'2025-06-23 07:08:51'),(22,'Jorge','Salazar','C99887766','23232323','Docente','jorge.salazar@utp.edu.pe','932109876',1,'2025-06-23 07:08:51'),(23,'Operador','Garita','operador','654321','operador','operador@sistema.com','000000000',1,'2025-06-27 18:12:07');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehiculos`
--

DROP TABLE IF EXISTS `vehiculos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehiculos` (
  `id_vehiculo` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `placa` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_vehiculo` enum('Auto','Moto','Bicicleta') COLLATE utf8mb4_unicode_ci NOT NULL,
  `marca` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `modelo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `imagen_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_vehiculo`),
  UNIQUE KEY `placa` (`placa`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `vehiculos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla para registrar los vehículos de los usuarios.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehiculos`
--

LOCK TABLES `vehiculos` WRITE;
/*!40000 ALTER TABLE `vehiculos` DISABLE KEYS */;
INSERT INTO `vehiculos` VALUES (1,1,'ABC-123','Auto','Toyota','Yaris','Rojo',1,'toyota-supra-anaranjado.jpeg'),(2,2,'DEF-456','Bicicleta','Hyundai','Tucson','Gris',0,NULL),(3,3,'GHI-789','Auto','Nissan','Sentra','Negro',1,'nissan-skylen-plomo.jpeg'),(4,4,'JKL-012','Auto','Kia','Picanto','Blanco',1,NULL),(5,5,'MNO-345','Auto','Suzuki','Swift','Azul',1,'subaru-forester-negro.jpeg'),(6,6,'PQR-678','Auto','Mazda','CX-5','Plata',1,NULL),(7,7,'STU-901','Auto','Chevrolet','Onix','Blanco',1,'chevrolet-camaro-amarillo.jpeg'),(8,8,'VWX-234','Auto','Volkswagen','Golf','Negro',1,'volkswagen-jetta-blanco.jpeg'),(9,9,'YZA-567','Auto','Honda','Civic','Gris',1,'honda-hibrido-rojo.jpeg'),(10,10,'BCD-890','Auto','Ford','Ranger','Azul',1,'ford-explorer-rojo.jpeg'),(11,11,'EFG-111','Auto','Toyota','RAV4','Rojo',1,'toyota-supra-anaranjado.jpeg'),(12,12,'HIJ-222','Auto','Kia','Sportage','Plata',1,NULL),(13,13,'KLM-333','Moto','BAJAJ','Pulsar','Negro',1,'toyoped-negro.jpeg'),(14,14,'NOP-444','Auto','Hyundai','Accent','Dorado',1,NULL),(15,15,'QRS-555','Moto','RONCO','Pantera','Rojo',1,'toyoped-negro.jpeg'),(16,16,'TUV-666','Auto','Nissan','Frontier','Blanco',1,'nissan-skylen-plomo.jpeg'),(17,17,'WXY-777','Auto','Audi','A4','Negro',1,NULL),(18,18,'ZAB-888','Moto','ITALIKA','FT150','Azul',1,'toyoped-negro.jpeg'),(19,19,'CDE-999','Auto','BMW','X1','Gris',1,'bmw-coupe-negro.jpeg'),(20,20,'FGH-000','Auto','Mercedes-Benz','A200','Blanco',1,NULL),(21,21,'BICI-001','Bicicleta','Monark','Mountain','Verde',1,NULL),(22,22,'BICI-002','Bicicleta','Trek','Urban','Negra',1,NULL);
/*!40000 ALTER TABLE `vehiculos` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-19 16:00:12
