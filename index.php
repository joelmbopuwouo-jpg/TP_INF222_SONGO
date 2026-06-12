<?php
header('Content-Type: application/json');

// 1. Initialisation ou récupération de la session
session_start();

if (!isset($_SESSION['game_state'])) {
    $_SESSION['game_state'] = [
        "status" => "EnCours",
        "currentPlayer" => "south",
        "scores" => ["north" => 0, "south" => 0],
        "board" => [
            "north" => [5, 5, 5, 5, 5, 5, 5],
            "south" => [5, 5, 5, 5, 5, 5, 5]
        ],
        "dernierCoup" => "Initialisation du plateau distant."
    ];
}

// 2. Gestion des requêtes POST (Quand le joueur clique ou réinitialise)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    // Action de réinitialisation
    if ($action === 'reset') {
        $_SESSION['game_state'] = [
            "status" => "EnCours",
            "currentPlayer" => "south",
            "scores" => ["north" => 0, "south" => 0],
            "board" => [
                "north" => [5, 5, 5, 5, 5, 5, 5],
                "south" => [5, 5, 5, 5, 5, 5, 5]
            ],
            "dernierCoup" => "La partie distante a été réinitialisée."
        ];
        echo json_encode($_SESSION['game_state']);
        exit;
    }

    // Action de jeu
    if ($action === 'jouer') {
        $player = $_POST['player'] ?? '';
        $index = isset($_POST['index']) ? (int)$_POST['index'] : -1;

        $state = $_SESSION['game_state'];

        // Sécurités de base côté serveur
        if ($state['status'] === 'Terminee') {
            echo json_encode(["error" => "La partie est déjà terminée."]);
            exit;
        }
        if ($player !== $state['currentPlayer']) {
            echo json_encode(["error" => "Ce n'est pas le tour de ce joueur."]);
            exit;
        }
        if ($index < 0 || $index > 6 || $state['board'][$player][$index] === 0) {
            echo json_encode(["error" => "Case invalide ou vide."]);
            exit;
        }

        // --- APPLICATION DU COUP (HUMAIN OU IA) ---
        // On isole ton algorithme dans une fonction interne pour pouvoir l'exécuter 2 fois si mode IA
        function appliquerLogiqueCoup(&$state, $splayer, $sindex) {
            $graines = $state['board'][$splayer][$sindex];
            $state['board'][$splayer][$sindex] = 0;

            $scurrentSide = $splayer;
            $scurrentIndex = $sindex;

            // Distribution pas à pas (Ton algo anti-horaire)
            while ($graines > 0) {
                if ($scurrentSide === 'south') {
                    $scurrentIndex++;
                    if ($scurrentIndex > 6) {
                        $scurrentSide = 'north';
                        $scurrentIndex = 6; // On commence par la droite chez le Nord
                    }
                } else { // Côté North
                    $scurrentIndex--;
                    if ($scurrentIndex < 0) {
                        $scurrentSide = 'south';
                        $scurrentIndex = 0; // On commence par la gauche chez le Sud
                    }
                }

                // On dépose une graine
                $state['board'][$scurrentSide][$scurrentIndex]++;
                $graines--;
            }

            // Logique de capture (Ton algo)
            $sadversaire = ($splayer === 'south') ? 'north' : 'south';
            if ($scurrentSide === $sadversaire) {
                $sfinalSeeds = $state['board'][$scurrentSide][$scurrentIndex];
                if ($sfinalSeeds === 2 || $sfinalSeeds === 3 || $sfinalSeeds === 4) {
                    $state['scores'][$splayer] += $sfinalSeeds;
                    $state['board'][$scurrentSide][$scurrentIndex] = 0;
                }
            }

            // Enregistrement du message dans l'historique
            $nomAffichage = ($splayer === 'south') ? "SUD" : "NORD (IA)";
            $state['dernierCoup'] = strtoupper($nomAffichage) . " a joué la case " . ($sindex + 1);

            // Changement de tour
            $state['currentPlayer'] = ($splayer === 'south') ? 'north' : 'south';

            // Vérification fin de partie
            if ($state['scores']['north'] >= 36 || $state['scores']['south'] >= 36) {
                $state['status'] = "Terminee";
            }
        }

        // 1. On fait jouer le joueur Humain (South)
        appliquerLogiqueCoup($state, $player, $index);

        // 2. TOUR DE L'IA (NORD) : Si le mode d'URL ?mode=ia est actif et que c'est au Nord de jouer
        if (isset($_GET['mode']) && $_GET['mode'] === 'ia' && $state['currentPlayer'] === 'north' && $state['status'] !== 'Terminee') {
            
            // L'IA analyse ses cases pour trouver celles qui ont des graines
            $casesPossibles = [];
            foreach ($state['board']['north'] as $i => $v) {
                if ($v > 0) {
                    $casesPossibles[] = $i;
                }
            }

            // Si l'IA peut jouer, elle choisit une case au hasard
            if (!empty($casesPossibles)) {
                $indexIA = $casesPossibles[array_rand($casesPossibles)];
                
                // L'IA joue en réutilisant exactement les mêmes règles
                appliquerLogiqueCoup($state, 'north', $indexIA);
            }
        }

        // Sauvegarde de l'état final en session et renvoi au JS
        $_SESSION['game_state'] = $state;
        echo json_encode($_SESSION['game_state']);
        exit;
    }
}

// 3. Gestion des requêtes GET (Le polling de synchronisation)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = $_GET['action'] ?? '';
    if ($action === 'get_state') {
        echo json_encode($_SESSION['game_state']);
        exit;
    }
}
