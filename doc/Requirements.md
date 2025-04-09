# Requirements Document - GeoControl

Date:

Version: V1 - description of Geocontrol as described in the swagger

| Version number | Change |
| :------------: | :----: |
|                |        |

# Contents

- [Requirements Document - GeoControl](#requirements-document---geocontrol)
- [Contents](#contents)
- [Informal description](#informal-description)
- [Business model](#business-model)
- [Stakeholders](#stakeholders)
- [Context Diagram and interfaces](#context-diagram-and-interfaces)
  - [Context Diagram](#context-diagram)
  - [Interfaces](#interfaces)
- [Stories and personas](#stories-and-personas)
- [Functional and non functional requirements](#functional-and-non-functional-requirements)
  - [Functional Requirements](#functional-requirements)
  - [Non Functional Requirements](#non-functional-requirements)
- [Use case diagram and use cases](#use-case-diagram-and-use-cases)
  - [Use case diagram](#use-case-diagram)
    - [Use case 1, UC1](#use-case-1-uc1)
      - [Scenario 1.1](#scenario-11)
      - [Scenario 1.2](#scenario-12)
      - [Scenario 1.x](#scenario-1x)
    - [Use case 2, UC2](#use-case-2-uc2)
    - [Use case x, UCx](#use-case-x-ucx)
- [Glossary](#glossary)
- [System Design](#system-design)
- [Deployment Diagram](#deployment-diagram)

# Informal description

GeoControl is a software system designed for monitoring physical and environmental variables in various contexts: from hydrogeological analyses of mountain areas to the surveillance of historical buildings, and even the control of internal parameters (such as temperature or lighting) in residential or working environments.

# Business Model

<!-- 1- Goverment Public Model perché in prima battuta venduto per la regione Piemonte

2- Data Monetization Model (Vendita dei dati a enti pubblici o privati con tariffe personalizzate?)

3- Software Licensing Model  -->
GeoControl is a system designed to collect data from sensors, process it, and store it in order to detect specific variations in the geographical conditions of the Piedmont region, with a focus on parameters such as temperature, humidity, and light intensity. The project was commissioned by the Union of Mountain Communities of Piedmont with the goal of monitoring the region’s hydrogeological conditions, paying particular attention to the state of historical buildings as well as residential and working environments in mountainous areas.
Thanks to its modular architecture, the system provides the collected information to both public and private entities, ensuring a high level of accuracy in data measurement.

# Stakeholders

| Stakeholder           | Description                                             |
|:---------------------:|:-------------------------------------------------------:|
| System Administrator  | Manages the system and the connected sensors            |
| Software Developers   | Develop and test the system software                    |
| Providers             | Supply hardware/software to support the system          |
| Users                 | Access and utilize the acquired data                    |
| Operators             | Managest the system by modifying and updating data      |


# Context Diagram and interfaces

## Context Diagram

![alt text](img/English-ContextDiagram.png)

## Interfaces


| **Actor/Element**         | **Logical Interface**                                                                  | **Physical Interface**                                               |
|---------------------------|----------------------------------------------------------------------------------------|----------------------------------------------------------------------|
| **System Administrator**  | - Web Admin GUI<br>- Command Line Interface (CLI) via SSH                              | - PC/Laptop with keyboard and screen<br>- VPN/Remote network         |
| **Operator**              | - Web GUI (for network/sensor management)<br>- API (if scripted)                       | - PC/Tablet<br>- Physical connections to gateways (serial/USB)       |
| **Viewer**                | - Web GUI (read-only)<br>- API (read-only)                                             | - PC/Smartphone/Tablet with browser                                  |
| **Sensor (device)**       | - Serial/Modbus protocol (or similar)<br>- Transmission of raw data (timestamp + value)| - Serial cable/wireless connection<br>- Battery or AC power supply   |
| **Gateway (device)**      | - Embedded software for data processing<br>- Network protocol (HTTP, MQTT, etc.)       | - Network interface (Ethernet/4G)<br>- Serial/USB input ports        |



# Stories and personas

## The Operator role can manage networks, gateways, sensors, and insert measurements, but does not have access to user-related functionalities.
## Persona N2: Operator 

+_**Story N1:**_ As an Operator, I want to manage networks, so that I can organize the infrastructure efficiently.
+_**Story N2:**_ As an Operator, I want to manage gateways, so that I can control data transmission within the network.
+_**Story N3:**_ As an Operator, I want to manage gateways, so that I can control data transmission within the network.
+_**Story N4:**_ As an Operator, I want to manage sensors, so that I can ensure accurate data collection from the field.
+_**Story N5:**_ As an Operator, I want to insert measurements, so that the system can record and use real-time data.
+_**Story N6:**_ As an Operator, I must not access or manage user accounts, so that the system ensures proper role-based access control. ("non-story")

\<A Persona is a realistic impersonation of an actor. Define here a few personas and describe in plain text how a persona interacts with the system>

\<Persona is-an-instance-of actor>

\<stories will be formalized later as scenarios in use cases>

# Functional and non functional requirements

## Functional Requirements

\<In the form DO SOMETHING, or VERB NOUN, describe high level capabilities of the system>

\<they match to high level use cases>

|  ID   | Description |
| :---: | :---------: |
|  FR1  |             |
|  FR2  |             |
| FRx.. |             |

## Non Functional Requirements

\<Describe constraints on functional requirements>

|   ID    | Type (efficiency, reliability, ..) | Description | Refers to |
| :-----: | :--------------------------------: | :---------: | :-------: |
|  NFR1   |                                    |             |           |
|  NFR2   |                                    |             |           |
|  NFR3   |                                    |             |           |
| NFRx .. |                                    |             |           |

# Use case diagram and use cases

## Use case diagram

\<define here UML Use case diagram UCD summarizing all use cases, and their relationships>

\<next describe here each use case in the UCD>

### Use case 1, UC1

| Actors Involved  |                                                                      |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | \<Boolean expression, must evaluate to true before the UC can start> |
|  Post condition  |  \<Boolean expression, must evaluate to true after UC is finished>   |
| Nominal Scenario |         \<Textual description of actions executed by the UC>         |
|     Variants     |                      \<other normal executions>                      |
|    Exceptions    |                        \<exceptions, errors >                        |

##### Scenario 1.1

\<describe here scenarios instances of UC1>

\<a scenario is a sequence of steps that corresponds to a particular execution of one use case>

\<a scenario is a more formal description of a story>

\<only relevant scenarios should be described>

|  Scenario 1.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | \<Boolean expression, must evaluate to true before the scenario can start> |
| Post condition |  \<Boolean expression, must evaluate to true after scenario is finished>   |
|     Step#      |                                Description                                 |
|       1        |                                                                            |
|       2        |                                                                            |
|      ...       |                                                                            |

##### Scenario 1.2

##### Scenario 1.x

### Use case 2, UC2

..

### Use case x, UCx

..

# Glossary

\<use UML class diagram to define important terms, or concepts in the domain of the application, and their relationships>

\<concepts must be used consistently all over the document, ex in use cases, requirements etc>

# System Design

\<describe here system design>

\<must be consistent with Context diagram>

# Deployment Diagram

\<describe here deployment diagram >
