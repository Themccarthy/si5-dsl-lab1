# si5-dsl-lab1

Notre objectif était d'améliorer le noyau disponible dans le zoo1 ArduinoML avec de nouvelles fonctionnalités, et de fournir un DSL complet qui apporte une valeur ajoutée aux utilisateurs finaux d'ArduinoML.

Au sein de notre équipe, nous avons couvert les 4 scénarios requis et réalisé 2 extensions du sujet dans un DSL interne et dans un DSL externe. Ces extensions sont **PIN allocation generator** et **Supporting the LCD screen.**

Notre projet dispose d’un dossier Internal et d’un dossier External qui contiennent respectivement notre DSL interne (Groovy) et notre DLS externe (Langium). Les scénarios sont dans les dossiers External/DSL et Internal/script.

Un diagramme de classe nommé ArduinoML.png, représentant la grammaire abstraite du projet, est également présent à la racine du projet.

Dans chacun des DSL vous trouverez un fichier d’explication pour lancer les différents scénarios.

La génération des scénarios remplit un fichier de log aml.log présent dans les deux DSL qui déclare les ressources matérielles (pins et bus) et explique l’assignation de chaque brique à un pin/bus.

**Scénarios de base :**

1. **scenario_1.aml**: Une pression sur un bouton active deux LED. Le fait de relâcher le bouton éteint les actionneurs.
2. **scenario_2.aml**: Elle allume une LED si et seulement si deux boutons sont enfoncés en même temps. Le relâchement d'au moins un des boutons arrête le son.
3. **scenario_3.aml**: Le fait d'appuyer une fois sur le bouton fait passer le système dans un mode où la LED est allumée. Une nouvelle pression sur le bouton l'éteint.
4. **scenario_4.aml**: Une pression sur le bouton déclenche l'allumage d’une première LED. Le fait d'appuyer à nouveau sur le bouton éteint la première LED et allume la seconde LED.
    
    Une nouvelle pression éteint la seconde LED, et le système est prêt à allumer à nouveau la première LED après une pression et ainsi de suite.
    

**Extension supporting the LCD screen :**

1. **screen.aml**: Une pression sur un bouton active une LED et écrit sur l’écran LCD le texte « allume ». Le fait de relâcher le bouton éteint la LED et écrit sur l’écran LCD « eteint ».
2. **screen_error_content.aml**: ce scénario met en lumière le bon fonctionnement du validateur de taille de texte pour l’écran LCD.
    
    Ici le texte que tente d’écrire l’utilisateur est « anticonstitutionnellement » or ce texte dépasse 16 caractères (la taille par défaut de l’écran LCD).
    
3. ****screen_big.aml:**** dans ce scénario on part de l’hypothèse que l’utilisateur utilise le système avec un écran LCD qui n’a pas la taille par défauts mais une taille 26, ainsi en déclarant la taille de l’écran il peut écrire des mots avec jusqu’à 26 caractères.

**Extension PIN allocation generator :**

1. pins.mal : ce scénario est identique au scénario **scénario_1.aml** cependant aucun pin n’a été renseigné par l’utilisateur. Ils ont tous été alloués dynamiquement par le générateur.
2. pins_screen.aml : ****ce scénario est identique au scénario **screen.aml**cependant aucun pin ni bus n’a été renseigné par l’utilisateur. Ils ont tous été alloués dynamiquement par le générateur. Un bus a été alloué à l’écran LCD en prenant compte les disponibilités possibles dues à l’allocation du bouton et de la LED.
3. pins_error_bricks.aml **:** ce scénario met en lumière le bon fonctionnement des validateurs qui vérifient s’il existe assez de pins ou de bus sur la carte par rapport aux briques déclarées. (Verif1, Verif2)
    
    Ici l’utilisateur donne à son système plus de LEDs que de pins disponibles sur la carte Arduino et plus d’écrans que de bus disponibles.
    
4. pins_error_type.aml **:** ce scénario met en lumière le bon fonctionnement du validateur qui vérifie si une brique est assignée à un pin de même type. (Verif3)
    
    Ici l’utilisateur assigne à une LED un pin analogique. Ce qui n’est pas possible car la LED nécessite un pin numérique.
    
5. pins_error_wrong_pin.aml : ce scénario met en lumière le bon fonctionnement du validateur de cohérence de pins/bus alloué par l’utilisateur sur ces briques. à Verif4
    
    Ici l’utilisateur tente d’allouer le pin 26 à sa LED, or le pin 26 n’est pas un pin numérique. Et d’alloué le bus 4 a un écran or par default se bus n’existe pas.
    
6. pins_error_same_pins.aml : ce scénario met en lumière le bon fonctionnement du validateur de cohérence de pins/bus alloué par l’utilisateur sur ces briques. (Verif5)
    
    Ici l’utilisateur tente d’allouer deux fois le même pin à deux LED différentes, et d’allouer deux fois le même bus à deux écrans.
    
7. pins_error_conflicy_pin.aml : ce scénario met en lumière le bon fonctionnement du validateur de cohérence de pins alloués par l’utilisateur sur ces briques. (Verif6)
    
    Ici l’utilisateur alloue le bus 1 a un écran LCD et tente également d’allouer le pin 8 a une LED. Or le bus comporte le pin 8.
    
    Ce scénario n’est présent que dans le DSL externe.
    

**Extensions supplémentaires :**

1. pins_declaration.aml: dans ce scénario on part de l’hypothèse que l’utilisateur utilise le système avec une carte Arduino différente de la nôtre avec des pins différents. Il déclare dans son système les différents pins de sa carte. Il n’alloue pas de pin à ses briques, les pins seront alloués dynamiquement par le générateur.
2. pins_declaration_screen.aml: dans ce scénario on part de l’hypothèse que l’utilisateur utilise le système avec une carte Arduino différente de la nôtre avec des bus différents. Il déclare dans son système les différents bus de sa carte et leur 7 pins respectifs Il n’alloue pas de bus à l’écran qu’il possède, le bus sera alloué dynamiquement par le générateur.
3. pins_declaration_error_name_pins.aml :ce scénario met en lumière le bon fonctionnement du validateur de cohérence des noms des pins déclarés.
    
    Ici l’utilisateur tente d’alloué deux fois le même nom de pin a deux pins différents.
    
4. pins_declaration_error_number_pins.aml : ce scénario met en lumière le bon fonctionnement du validateur de cohérence des numéros des pins déclarés.
    
    Ici l’utilisateur tente d’alloué deux fois le même numéro de pin a deux pins différents.
    
5. pins_declaration_bus_error_number.aml : ce scénario met en lumière le bon fonctionnement du validateur de cohérence des numéros des bus déclarés.
    
    Ici l’utilisateur tente d’allouer deux fois le même numéro de bus à deux bus différents.
    
6. pins_declaration_bus_error_pins.aml : ce scénario met en lumière le bon fonctionnement du validateur de cohérence des pins des bus déclarés.
    
    Ici l’utilisateur tente de déclarer un bus qui ne comporte pas 7 pins.