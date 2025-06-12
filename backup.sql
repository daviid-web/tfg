-- MySQL dump 10.13  Distrib 8.4.5, for Linux (x86_64)
--
-- Host: localhost    Database: fastcartradeDB
-- ------------------------------------------------------
-- Server version	8.4.5

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
-- Table structure for table `Anuncio`
--

DROP TABLE IF EXISTS `Anuncio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Anuncio` (
  `id` int NOT NULL AUTO_INCREMENT,
  `matricula` varchar(255) NOT NULL,
  `vendedor_id` int NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `estado` enum('activo','inactivo','vendido') NOT NULL DEFAULT 'activo',
  `imagen_principal` varchar(255) DEFAULT 'assets/default-car.jpg',
  `imagenes_adicionales` text,
  `fecha_publicacion` datetime NOT NULL,
  `fecha_actualizacion` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `matricula` (`matricula`),
  KEY `vendedor_id` (`vendedor_id`),
  CONSTRAINT `Anuncio_ibfk_1` FOREIGN KEY (`matricula`) REFERENCES `Vehiculo` (`matricula`) ON UPDATE CASCADE,
  CONSTRAINT `Anuncio_ibfk_2` FOREIGN KEY (`vendedor_id`) REFERENCES `Usuario` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Anuncio`
--

LOCK TABLES `Anuncio` WRITE;
/*!40000 ALTER TABLE `Anuncio` DISABLE KEYS */;
INSERT INTO `Anuncio` VALUES (1,'9876 LMN',2,'BMW Serie 3 320d Touring Elegance','Impecable BMW Serie 3 familiar, ideal para viajes largos y uso diario. Equipado con motor diésel eficiente y potente, navegación profesional, asientos de cuero y faros LED. Mantenimientos al día en servicio oficial. Siempre en garaje.',28500.00,'activo','1749748720413-imagen_principal.png','[\"1749748720536-imagenes_adicionales.png\",\"1749748720571-imagenes_adicionales.png\",\"1749748720589-imagenes_adicionales.png\"]','2025-06-12 17:18:41','2025-06-12 17:18:41'),(2,'1234 GBC',3,'Audi A4 2.0 TDI S line Sedán','Elegante y deportivo Audi A4 en excelente estado. Motor diésel de bajo consumo con un rendimiento impresionante. Paquete S line exterior e interior, sistema de sonido Bang & Olufsen, y asistente de estacionamiento. Único propietario, historial de mantenimiento completo.',35800.00,'activo','1749749057100-imagen_principal.png','[\"1749749057109-imagenes_adicionales.png\",\"1749749057126-imagenes_adicionales.png\",\"1749749057141-imagenes_adicionales.png\"]','2025-06-12 17:24:17','2025-06-12 17:24:17'),(3,'5678 HTJ',4,'Chevrolet Camaro 6.2 V8 SS Negro',' Impresionante Chevrolet Camaro SS en color negro medianoche, con motor V8 de 6.2 litros y cambio automático. Sonido espectacular, asientos deportivos de cuero, sistema de infoentretenimiento con pantalla táctil y cámara trasera. Coche de importación en perfecto estado, muy cuidado y siempre guardado en garaje.',48000.00,'activo','1749749293749-imagen_principal.webp','[\"1749749293750-imagenes_adicionales.webp\",\"1749749293753-imagenes_adicionales.webp\",\"1749749293762-imagenes_adicionales.webp\"]','2025-06-12 17:28:13','2025-06-12 17:28:13'),(4,'7890 KXZ',5,'Citroën C5 Aircross PureTech 130 S&S C-Series','SUV familiar muy cómodo y espacioso, ideal para la ciudad y viajes. Versión C-Series con equipamiento extra: asientos Advanced Comfort, suspensión con Amortiguadores Progresivos Hidráulicos, pantalla táctil de 10 pulgadas y navegador. Prácticamente nuevo, muy pocos kilómetros.',25900.00,'activo','1749749646193-imagen_principal.jpeg','[\"1749749646210-imagenes_adicionales.webp\",\"1749749646214-imagenes_adicionales.webp\",\"1749749646217-imagenes_adicionales.webp\"]','2025-06-12 17:34:06','2025-06-12 17:34:06'),(5,'2345 PQR',5,'Dacia Duster 1.0 TCe 100 CV Essential 4x2','Dacia Duster fiable y robusto, perfecto para el día a día y escapadas. Motor de bajo consumo, aire acondicionado, radio con Bluetooth y barras de techo. Un solo propietario, revisiones al día. Ideal para quien busca un SUV práctico y económico.',14500.00,'activo','1749749855080-imagen_principal.webp','[\"1749749855086-imagenes_adicionales.webp\",\"1749749855095-imagenes_adicionales.webp\",\"1749749855100-imagenes_adicionales.webp\"]','2025-06-12 17:37:35','2025-06-12 17:37:35'),(6,'3456STU',6,'Ford Focus 1.0 EcoBoost 125 CV ST-Line','Deportivo y eficiente Ford Focus ST-Line. Equipado con motor EcoBoost de bajo consumo, suspensión deportiva, asientos semibackets, pantalla táctil con SYNC 3, y llantas de aleación. Mantenimiento completo en la casa oficial, perfecto para ciudad y carretera.',18900.00,'activo','1749750159057-imagen_principal.webp','[\"1749750159058-imagenes_adicionales.webp\",\"1749750159067-imagenes_adicionales.webp\",\"1749750159072-imagenes_adicionales.webp\"]','2025-06-12 17:42:39','2025-06-12 17:42:39'),(7,'4567VXW',2,'Volkswagen Polo 1.0 TSI 95 CV Advance','Volkswagen Polo moderno y ágil, perfecto para la ciudad. Motor de gasolina eficiente, pantalla táctil con App-Connect, control de crucero y sensores de aparcamiento traseros. Muy bien cuidado, revisiones al día en concesionario oficial.\r\n',15700.00,'activo','1749753362066-imagen_principal.png','[\"1749753362106-imagenes_adicionales.png\",\"1749753362118-imagenes_adicionales.png\",\"1749753362137-imagenes_adicionales.png\"]','2025-06-12 18:36:02','2025-06-12 18:36:02'),(8,'8765FGH',2,'Toyota Corolla 1.8 Hybrid Active Tech','Eficiente y moderno Toyota Corolla híbrido en excelente estado. Ideal para ciudad y carretera con su bajo consumo. Equipado con pantalla táctil, cámara trasera, control de crucero adaptativo y sistema de seguridad Toyota Safety Sense. Todas las revisiones en concesionario oficial.',22500.00,'activo','1749753529464-imagen_principal.png','[\"1749753529473-imagenes_adicionales.png\",\"1749753529484-imagenes_adicionales.png\",\"1749753529492-imagenes_adicionales.png\"]','2025-06-12 18:38:49','2025-06-12 18:38:49');
/*!40000 ALTER TABLE `Anuncio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `AnuncioVehiculo`
--

DROP TABLE IF EXISTS `AnuncioVehiculo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `AnuncioVehiculo` (
  `vehiculo_id` varchar(255) NOT NULL,
  `anuncio_id` int NOT NULL,
  PRIMARY KEY (`vehiculo_id`,`anuncio_id`),
  KEY `anuncio_id` (`anuncio_id`),
  CONSTRAINT `AnuncioVehiculo_ibfk_1` FOREIGN KEY (`vehiculo_id`) REFERENCES `Vehiculo` (`matricula`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `AnuncioVehiculo_ibfk_2` FOREIGN KEY (`anuncio_id`) REFERENCES `Anuncio` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AnuncioVehiculo`
--

LOCK TABLES `AnuncioVehiculo` WRITE;
/*!40000 ALTER TABLE `AnuncioVehiculo` DISABLE KEYS */;
/*!40000 ALTER TABLE `AnuncioVehiculo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Comentarios`
--

DROP TABLE IF EXISTS `Comentarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Comentarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `comentario` text NOT NULL,
  `valoracion` int DEFAULT NULL,
  `vendedor_id` int NOT NULL,
  `comprador_id` int NOT NULL,
  `fecha_comentario` datetime NOT NULL,
  `anuncio_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `vendedor_id` (`vendedor_id`),
  KEY `comprador_id` (`comprador_id`),
  KEY `anuncio_id` (`anuncio_id`),
  CONSTRAINT `Comentarios_ibfk_1` FOREIGN KEY (`vendedor_id`) REFERENCES `Usuario` (`id`),
  CONSTRAINT `Comentarios_ibfk_2` FOREIGN KEY (`comprador_id`) REFERENCES `Usuario` (`id`),
  CONSTRAINT `Comentarios_ibfk_3` FOREIGN KEY (`anuncio_id`) REFERENCES `Anuncio` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Comentarios`
--

LOCK TABLES `Comentarios` WRITE;
/*!40000 ALTER TABLE `Comentarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `Comentarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Favorito`
--

DROP TABLE IF EXISTS `Favorito`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Favorito` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `anuncio_id` int NOT NULL,
  `fecha_agregado` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `anuncio_id` (`anuncio_id`),
  CONSTRAINT `Favorito_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `Usuario` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Favorito_ibfk_2` FOREIGN KEY (`anuncio_id`) REFERENCES `Anuncio` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Favorito`
--

LOCK TABLES `Favorito` WRITE;
/*!40000 ALTER TABLE `Favorito` DISABLE KEYS */;
/*!40000 ALTER TABLE `Favorito` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Marcas`
--

DROP TABLE IF EXISTS `Marcas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Marcas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `pais` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Marcas`
--

LOCK TABLES `Marcas` WRITE;
/*!40000 ALTER TABLE `Marcas` DISABLE KEYS */;
INSERT INTO `Marcas` VALUES (1,'Toyota','Japn','2025-06-12 17:09:04','2025-06-12 17:09:04'),(2,'BMW','Alemania','2025-06-12 17:09:04','2025-06-12 17:09:04'),(3,'Mercedes','Alemania','2025-06-12 17:09:04','2025-06-12 17:09:04'),(4,'Audi','Alemania','2025-06-12 17:09:04','2025-06-12 17:09:04'),(5,'Volkswagen','Alemania','2025-06-12 17:09:04','2025-06-12 17:09:04'),(6,'Ford','Estados Unidos','2025-06-12 17:09:04','2025-06-12 17:09:04'),(7,'Chevrolet','Estados Unidos','2025-06-12 17:09:04','2025-06-12 17:09:04'),(8,'Honda','Japn','2025-06-12 17:09:04','2025-06-12 17:09:04'),(9,'Nissan','Japn','2025-06-12 17:09:04','2025-06-12 17:09:04'),(10,'Hyundai','Corea del Sur','2025-06-12 17:09:04','2025-06-12 17:09:04'),(11,'Kia','Corea del Sur','2025-06-12 17:09:04','2025-06-12 17:09:04'),(12,'Renault','Francia','2025-06-12 17:09:04','2025-06-12 17:09:04'),(13,'Peugeot','Francia','2025-06-12 17:09:04','2025-06-12 17:09:04'),(14,'Citron','Francia','2025-06-12 17:09:04','2025-06-12 17:09:04'),(15,'Seat','Espaa','2025-06-12 17:09:04','2025-06-12 17:09:04'),(16,'Fiat','Italia','2025-06-12 17:09:04','2025-06-12 17:09:04'),(17,'Mazda','Japn','2025-06-12 17:09:04','2025-06-12 17:09:04'),(18,'Opel','Alemania','2025-06-12 17:09:04','2025-06-12 17:09:04'),(19,'Volvo','Suecia','2025-06-12 17:09:04','2025-06-12 17:09:04'),(20,'Porsche','Alemania','2025-06-12 17:09:04','2025-06-12 17:09:04'),(21,'Skoda','Chequia','2025-06-12 17:09:04','2025-06-12 17:09:04'),(22,'Subaru','Japn','2025-06-12 17:09:04','2025-06-12 17:09:04'),(23,'Lexus','Japn','2025-06-12 17:09:04','2025-06-12 17:09:04'),(24,'Tesla','Estados Unidos','2025-06-12 17:09:04','2025-06-12 17:09:04'),(25,'Jeep','Estados Unidos','2025-06-12 17:09:04','2025-06-12 17:09:04'),(26,'Dacia','Rumana','2025-06-12 17:09:04','2025-06-12 17:09:04'),(27,'Mitsubishi','Japn','2025-06-12 17:09:04','2025-06-12 17:09:04'),(28,'Alfa Romeo','Italia','2025-06-12 17:09:04','2025-06-12 17:09:04'),(29,'Suzuki','Japn','2025-06-12 17:09:04','2025-06-12 17:09:04'),(30,'Mini','Reino Unido','2025-06-12 17:09:04','2025-06-12 17:09:04');
/*!40000 ALTER TABLE `Marcas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Mensaje`
--

DROP TABLE IF EXISTS `Mensaje`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Mensaje` (
  `id` int NOT NULL AUTO_INCREMENT,
  `emisor_id` int NOT NULL,
  `receptor_id` int NOT NULL,
  `contenido` text NOT NULL,
  `anuncio_id` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `emisor_id` (`emisor_id`),
  KEY `receptor_id` (`receptor_id`),
  KEY `anuncio_id` (`anuncio_id`),
  CONSTRAINT `Mensaje_ibfk_1` FOREIGN KEY (`emisor_id`) REFERENCES `Usuario` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Mensaje_ibfk_2` FOREIGN KEY (`receptor_id`) REFERENCES `Usuario` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Mensaje_ibfk_3` FOREIGN KEY (`anuncio_id`) REFERENCES `Anuncio` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Mensaje`
--

LOCK TABLES `Mensaje` WRITE;
/*!40000 ALTER TABLE `Mensaje` DISABLE KEYS */;
/*!40000 ALTER TABLE `Mensaje` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Modelo`
--

DROP TABLE IF EXISTS `Modelo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Modelo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `marca_id` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `marca_id` (`marca_id`),
  CONSTRAINT `Modelo_ibfk_1` FOREIGN KEY (`marca_id`) REFERENCES `Marcas` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Modelo`
--

LOCK TABLES `Modelo` WRITE;
/*!40000 ALTER TABLE `Modelo` DISABLE KEYS */;
INSERT INTO `Modelo` VALUES (1,'Corolla',1,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(2,'Camry',1,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(3,'RAV4',1,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(4,'Serie 3',2,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(5,'Serie 5',2,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(6,'X5',2,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(7,'Clase A',3,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(8,'Clase C',3,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(9,'GLC',3,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(10,'A3',4,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(11,'A4',4,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(12,'Q5',4,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(13,'Golf',5,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(14,'Polo',5,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(15,'Tiguan',5,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(16,'Fiesta',6,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(17,'Focus',6,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(18,'Mustang',6,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(19,'Spark',7,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(20,'Cruze',7,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(21,'Camaro',7,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(22,'Civic',8,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(23,'Accord',8,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(24,'CR-V',8,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(25,'Micra',9,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(26,'Qashqai',9,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(27,'X-Trail',9,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(28,'i20',10,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(29,'Tucson',10,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(30,'Santa Fe',10,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(31,'Rio',11,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(32,'Ceed',11,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(33,'Sportage',11,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(34,'Clio',12,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(35,'Megane',12,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(36,'Captur',12,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(37,'208',13,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(38,'308',13,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(39,'3008',13,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(40,'C3',14,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(41,'C4',14,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(42,'C5 Aircross',14,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(43,'Ibiza',15,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(44,'Len',15,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(45,'Arona',15,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(46,'500',16,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(47,'Panda',16,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(48,'Tipo',16,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(49,'Mazda3',17,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(50,'CX-5',17,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(51,'MX-5',17,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(52,'Corsa',18,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(53,'Astra',18,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(54,'Mokka',18,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(55,'XC40',19,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(56,'XC60',19,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(57,'S60',19,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(58,'911',20,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(59,'Cayenne',20,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(60,'Macan',20,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(61,'Fabia',21,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(62,'Octavia',21,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(63,'Superb',21,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(64,'Impreza',22,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(65,'Forester',22,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(66,'Outback',22,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(67,'IS',23,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(68,'NX',23,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(69,'RX',23,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(70,'Model 3',24,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(71,'Model S',24,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(72,'Model Y',24,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(73,'Renegade',25,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(74,'Compass',25,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(75,'Wrangler',25,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(76,'Sandero',26,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(77,'Duster',26,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(78,'Jogger',26,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(79,'ASX',27,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(80,'Outlander',27,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(81,'L200',27,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(82,'Giulia',28,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(83,'Stelvio',28,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(84,'Tonale',28,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(85,'Swift',29,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(86,'Vitara',29,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(87,'Jimny',29,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(88,'Cooper',30,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(89,'Countryman',30,'2025-06-12 17:09:06','2025-06-12 17:09:06'),(90,'Clubman',30,'2025-06-12 17:09:06','2025-06-12 17:09:06');
/*!40000 ALTER TABLE `Modelo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Reporte`
--

DROP TABLE IF EXISTS `Reporte`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Reporte` (
  `id` int NOT NULL AUTO_INCREMENT,
  `motivo` varchar(255) NOT NULL,
  `usuarioId` int NOT NULL,
  `anuncioId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `usuarioId` (`usuarioId`),
  KEY `anuncioId` (`anuncioId`),
  CONSTRAINT `Reporte_ibfk_1` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Reporte_ibfk_2` FOREIGN KEY (`anuncioId`) REFERENCES `Anuncio` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Reporte`
--

LOCK TABLES `Reporte` WRITE;
/*!40000 ALTER TABLE `Reporte` DISABLE KEYS */;
/*!40000 ALTER TABLE `Reporte` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Usuario`
--

DROP TABLE IF EXISTS `Usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Usuario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `correo` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('comprador','vendedor','admin') DEFAULT 'comprador',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `foto` varchar(255) DEFAULT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `fecha_registro` datetime NOT NULL,
  `fecha_actualizacion` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Usuario`
--

LOCK TABLES `Usuario` WRITE;
/*!40000 ALTER TABLE `Usuario` DISABLE KEYS */;
INSERT INTO `Usuario` VALUES (1,'admin','admin@admin.com','$2b$10$19PPBlT.O/6RAj03496BpeaNDFau95hJ9qKFb6uE/1LgaGJWWMjle','admin',1,NULL,NULL,'2025-06-12 12:34:45','2025-06-12 12:34:45'),(2,'David Velasco Durán','david@gmail.com','$2b$10$qxYBfkum3bYSdK.EEgZ0DOiAV17hFceTjvEl9mYkrigLnW.f0mI4G','vendedor',1,NULL,NULL,'2025-06-12 12:40:47','2025-06-12 18:19:16'),(3,'Minerva Gil Cote','minerva@gmail.com','$2b$10$vuKHWiPemfkNjAJS49SQ/.M8QqC49BQM27nfxN6ttbZ6c3BrQ9edS','vendedor',1,NULL,NULL,'2025-06-12 16:15:30','2025-06-12 17:19:37'),(4,'Daniel Sobao','dani@gmail.com','$2b$10$tBzcu9kolVyISu2dNyiLYe0leaKba5baCbcYTCxXAVY24JxHovGjS','vendedor',1,NULL,NULL,'2025-06-12 16:16:10','2025-06-12 17:26:21'),(5,'Alejandro Periñan','peri@gmail.com','$2b$10$BlutPnp48H6wHMYYjf4thOywiWO33xHqWseamVIZz2JvNNXeLHNou','vendedor',1,NULL,NULL,'2025-06-12 16:29:38','2025-06-12 17:30:42'),(6,'Antonio López','antonio@gmail.com','$2b$10$TXCX2PON5.6w5Q.kTgtgxuZWyw7xSIgUqe4EK1IadBE5kV5lQY.l.','vendedor',1,NULL,NULL,'2025-06-12 16:31:19','2025-06-12 17:38:47'),(7,'Juan Perez','juan@gmail.com','$2b$10$1Zx4Bu0l7eJNWEMGiUE4b.tfgzan.OBHpc2hv.ftrFDGEJyQ4PMKW','comprador',1,NULL,NULL,'2025-06-12 16:32:35','2025-06-12 18:16:49');
/*!40000 ALTER TABLE `Usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Vehiculo`
--

DROP TABLE IF EXISTS `Vehiculo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Vehiculo` (
  `matricula` varchar(255) NOT NULL,
  `modelo_id` int NOT NULL,
  `estado_vehiculo` enum('nuevo','seminuevo','kilometro_0','segunda_mano','ocasion','prototipo') NOT NULL,
  `anio` int NOT NULL,
  `kilometros` float NOT NULL,
  `combustible` enum('gasolina','diesel','electrico','hibrido','GLP','hidrogeno','otros') NOT NULL,
  `transmision` enum('manual','automatica','semiautomatica','CVT') NOT NULL,
  `traccion` enum('delantera','trasera','4x4') NOT NULL,
  `potencia` int NOT NULL,
  `cilindrada` int NOT NULL,
  `color` varchar(255) NOT NULL,
  `numero_puertas` int NOT NULL,
  `plazas` int NOT NULL,
  `peso` float DEFAULT NULL,
  `consumo` float DEFAULT NULL,
  `fotos` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`matricula`),
  UNIQUE KEY `matricula` (`matricula`),
  KEY `modelo_id` (`modelo_id`),
  CONSTRAINT `Vehiculo_ibfk_1` FOREIGN KEY (`modelo_id`) REFERENCES `Modelo` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Vehiculo`
--

LOCK TABLES `Vehiculo` WRITE;
/*!40000 ALTER TABLE `Vehiculo` DISABLE KEYS */;
INSERT INTO `Vehiculo` VALUES ('1234 GBC',11,'kilometro_0',2021,45,'gasolina','manual','trasera',150,1968,'Negro',5,5,NULL,NULL,NULL,'2025-06-12 17:24:17','2025-06-12 17:24:17'),('2345 PQR',77,'ocasion',2020,60000,'gasolina','manual','4x4',100,999,'Blanco',5,5,NULL,NULL,NULL,'2025-06-12 17:37:35','2025-06-12 17:37:35'),('3456STU',17,'ocasion',2019,80,'diesel','manual','trasera',125,998,'Rojo',3,3,NULL,NULL,NULL,'2025-06-12 17:42:39','2025-06-12 17:42:39'),('4567VXW',14,'segunda_mano',2020,55000,'diesel','manual','trasera',95,999,'Rojo',3,5,NULL,NULL,NULL,'2025-06-12 18:36:02','2025-06-12 18:36:02'),('5678 HTJ',21,'seminuevo',2018,30500,'gasolina','manual','trasera',455,6162,'Negro',5,5,NULL,NULL,NULL,'2025-06-12 17:28:13','2025-06-12 17:28:13'),('7890 KXZ',42,'segunda_mano',2022,120000,'electrico','automatica','delantera',130,1199,'Blanco',5,5,NULL,NULL,NULL,'2025-06-12 17:34:06','2025-06-12 17:34:06'),('8765FGH',1,'ocasion',2021,40000,'gasolina','automatica','trasera',122,1798,'azul',5,5,NULL,NULL,NULL,'2025-06-12 18:38:49','2025-06-12 18:38:49'),('9876 LMN',4,'seminuevo',2019,75,'diesel','automatica','delantera',190,1995,'Negro',5,5,NULL,NULL,NULL,'2025-06-12 17:18:40','2025-06-12 17:18:40');
/*!40000 ALTER TABLE `Vehiculo` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-12 18:41:13
