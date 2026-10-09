// ============================================================================
// Nysa — traduction de l'interface (français / anglais).
//
// Un seul fichier pour tous les textes du site. Chaque texte a une clé et ses
// deux versions côte à côte :
//
//     "login.h1": { fr: "Accès au simulateur complet", en: "Access the full simulator" },
//
// Dans une page :
//   - texte fixe :      <h1 data-i18n="login.h1">Accès au simulateur complet</h1>
//   - attribut :        data-i18n-ph (placeholder), data-i18n-title, data-i18n-aria, data-i18n-alt
//   - texte construit en JavaScript :  t("login.msg.created")
//   - pages très denses :              tx("texte français")  — voir la table I18N_TEXT plus bas
//   - avec une valeur :                t("auth.err.other", { msg: "…" })   →  « {msg} » dans le texte
//
// Les termes scientifiques (MTF, SNR, GSD, QE, PRNU, DSNU, WFE, iFoV, Nyquist…)
// et les unités ne sont pas traduits : ils s'écrivent pareil dans les deux langues.
//
// ----------------------------------------------------------------------------
// LANGUE AFFICHÉE (basculement fait le 06/10/2026)
//   - un nouveau visiteur voit le site en anglais (I18N_DEFAULT) ;
//   - le sélecteur EN / FR est visible partout (I18N_SWITCH) ;
//   - un utilisateur connecté a une langue de préférence, enregistrée avec
//     son compte : choisie à l'inscription, modifiable dans Paramètres ou par
//     le sélecteur. Elle s'applique à l'interface et aux e-mails.
// Pour revenir à un site tout en français : "fr" et false ci-dessous.
// ============================================================================
var I18N_DEFAULT = "en";
var I18N_SWITCH = true;
var I18N_LANGS = ["en", "fr"];
var I18N_STORAGE_KEY = "nysa_lang";

var I18N = {
  // ---------------- commun ----------------
  "brand.tagline":       { fr: "EO Imaging Engineering", en: "EO Imaging Engineering" },
  "lang.switch.label":   { fr: "Langue", en: "Language" },
  "lang.en":             { fr: "English", en: "English" },
  "lang.fr":             { fr: "Français", en: "Français" },
  "login.lang":          { fr: "Langue de l'interface et des e-mails", en: "Language for the interface and emails" },
  "settings.lang.label": { fr: "Langue", en: "Language" },
  "settings.lang.note":  { fr: "Langue de l'interface et des e-mails que vous recevez.", en: "Language of the interface and of the emails you receive." },
  "settings.lang.saving": { fr: "Enregistrement…", en: "Saving…" },
  "settings.lang.saved":  { fr: "Langue enregistrée", en: "Language saved" },
  "settings.lang.error":  { fr: "Enregistrement impossible. Réessayez.", en: "Could not save. Please try again." },
  "sim.banner":          { fr: "Vue simulée : {plan}", en: "Simulated view: {plan}" },
  "sim.exit":            { fr: "Quitter la simulation", en: "Exit simulation" },
  "sim.plan.free":       { fr: "gratuit", en: "free" },
  "sim.plan.beta":       { fr: "bêta", en: "beta" },
  "sim.plan.individuel": { fr: "individuel", en: "individual" },
  "sim.label":          { fr: "Voir comme", en: "View as" },
  "sim.note":           { fr: "Testez le site avec le plan d'un compte gratuit, bêta ou individuel. Vous restez administrateur.", en: "Test the site with the plan of a free, beta or individual account. You remain administrator." },
  "sim.opt.admin":      { fr: "Administrateur", en: "Administrator" },
  "sim.opt.free":       { fr: "Gratuit", en: "Free" },
  "sim.opt.beta":       { fr: "Bêta", en: "Beta" },
  "sim.opt.individuel": { fr: "Individuel", en: "Individual" },
  "sim.saving":         { fr: "Enregistrement…", en: "Saving…" },
  "sim.saved":          { fr: "Vue enregistrée", en: "View saved" },
  "sim.error":          { fr: "Enregistrement impossible. Réessayez.", en: "Could not save. Please try again." },
  "sub.badge.admin":    { fr: "Admin", en: "Admin" },
  "sub.admin.name":     { fr: "Administrateur", en: "Administrator" },
  "sub.admin.desc":     { fr: "Accès complet au simulateur", en: "Full access to the simulator" },
  // ---------------- onboarding (09/10/2026) ----------------
  "onb.aria": { fr: "Tutoriel", en: "Tutorial" },
  "onb.welcome.title": { fr: "Bienvenue sur Nysa", en: "Welcome to Nysa" },
  "onb.welcome.text": { fr: "Nysa vous permet de simuler les performances d'un instrument d'imagerie spatiale et d'explorer les images obtenues selon les conditions d'acquisition.", en: "Nysa lets you simulate the performance of a space imaging instrument and explore the images obtained under different acquisition conditions." },
  "onb.welcome.s1.t": { fr: "Instrument", en: "Instrument" },
  "onb.welcome.s1.d": { fr: "Vous créez vos instruments ici. Pour commencer, un instrument d'exemple est déjà créé.", en: "You create your instruments here. To get you started, an example instrument is already created." },
  "onb.welcome.s2.t": { fr: "Simulation", en: "Simulation" },
  "onb.welcome.s2.d": { fr: "Découvrez les conditions d'acquisition et lancez une simulation.", en: "Discover the acquisition conditions and run a simulation." },
  "onb.welcome.s3.t": { fr: "Résultats", en: "Results" },
  "onb.welcome.s3.d": { fr: "Visualisez l'image simulée et explorez les résultats.", en: "View the simulated image and explore the results." },
  "onb.welcome.explore": { fr: "Explorer par moi-même", en: "Explore on my own" },
  "onb.welcome.start": { fr: "Découvrir ma première simulation", en: "Discover my first simulation" },
  "onb.step": { fr: "Étape {n} sur {total}", en: "Step {n} of {total}" },
  "onb.next": { fr: "Suivant", en: "Next" },
  "onb.quit": { fr: "Quitter le tutoriel", en: "Leave the tutorial" },
  "onb.quit.toast": { fr: "Tutoriel fermé. Vous pouvez le relancer depuis Paramètres.", en: "Tutorial closed. You can restart it from Settings." },
  "onb.s0": { fr: "C'est ici que vous créez vos instruments (bouton « Créer un instrument »). Pour ce tutoriel, un instrument d'exemple est déjà créé : nous allons l'utiliser.", en: "This is where you create your instruments (\"Create an instrument\" button). For this tutorial, an example instrument is already created: we will use it." },
  "onb.s0.none": { fr: "C'est ici que vous créez vos instruments. Le tutoriel utilise un instrument complet : si l'exemple a été supprimé, créez-en un d'abord.", en: "This is where you create your instruments. The tutorial uses a complete instrument: if the example was deleted, create one first." },
  "onb.s2b": { fr: "Très bien. Cliquez sur « Suivant ».", en: "Great. Click \"Next\"." },
  "onb.s6.c1": { fr: "La lumière de la scène traverse l'atmosphère.", en: "The light from the scene travels through the atmosphere." },
  "onb.s6.c2": { fr: "L'optique de votre instrument la focalise (flou, aberrations).", en: "Your instrument's optics focus it (blur, aberrations)." },
  "onb.s6.c3": { fr: "Le détecteur la convertit en électrons, avec ses bruits.", en: "The detector converts it into electrons, with its noises." },
  "onb.s6.c4": { fr: "L'électronique la numérise en niveaux de gris : vous obtenez l'image telle que votre instrument l'aurait acquise.", en: "The electronics digitize it into gray levels: you get the image as your instrument would have acquired it." },
  "onb.s1": { fr: "Passons à la simulation. Cliquez sur « Simulations » dans le menu.", en: "Let's move on to the simulation. Click \"Simulations\" in the menu." },
  "onb.s2": { fr: "Choisissez votre image source : cliquez sur la scène que vous voulez observer.", en: "Choose your source image: click the scene you want to observe." },
  "onb.s3": { fr: "Voici l'instrument d'exemple, déjà sélectionné. Cliquez sur « Suivant ».", en: "This is the example instrument, already selected. Click \"Next\"." },
  "onb.s3.none": { fr: "Aucun instrument complet n'est disponible pour le moment. Terminez-en un depuis « Instruments », puis relancez le tutoriel depuis les Paramètres.", en: "No complete instrument is available at the moment. Finish one from \"Instruments\", then restart the tutorial from Settings." },
  "onb.s4": { fr: "Voici les conditions dans lesquelles votre instrument va acquérir une image : altitude du satellite, élévation du soleil, temps d'intégration et nombre d'étages TDI. Les valeurs proposées conviennent pour une première simulation, vous n'avez rien à modifier.", en: "These are the conditions under which your instrument will acquire an image: satellite altitude, sun elevation, integration time and number of TDI stages. The proposed values are fine for a first simulation, you do not need to change anything." },
  "onb.s5": { fr: "Tout est prêt. Cliquez ici pour générer votre première image simulée.", en: "Everything is ready. Click here to generate your first simulated image." },
  "onb.s6": { fr: "Le calcul est en cours, il prend entre 1 et 2 minutes. Gardez cette page ouverte. Pendant ce temps, Nysa simule la chaîne complète de votre instrument :", en: "The computation is running, it takes between 1 and 2 minutes. Keep this page open. Meanwhile, Nysa simulates the complete chain of your instrument:" },
  "onb.s6.error": { fr: "La simulation a échoué. Cliquez sur « Précédent » pour la relancer, ou quittez le tutoriel.", en: "The simulation failed. Click \"Previous\" to run it again, or leave the tutorial." },
  "onb.s6.stopped": { fr: "La simulation a été interrompue. Cliquez sur « Précédent » pour la relancer, ou quittez le tutoriel.", en: "The simulation was interrupted. Click \"Previous\" to run it again, or leave the tutorial." },
  "onb.s6.savefail": { fr: "Le calcul est terminé, mais l'enregistrement du résultat a échoué. Utilisez le bouton de nouvel essai affiché sous la barre de progression.", en: "The computation is finished, but saving the result failed. Use the retry button shown below the progress bar." },
  "onb.s7": { fr: "Votre simulation est terminée. Cliquez ici pour découvrir l'image obtenue et les informations associées.", en: "Your simulation is complete. Click here to see the resulting image and the associated information." },
  "onb.s8": { fr: "Voici votre image simulée, à côté de l'image source. Les onglets au-dessus donnent accès aux courbes MTF et SNR calculées pour votre instrument, et aux entrées de la simulation.", en: "Here is your simulated image, next to the source image. The tabs above give access to the MTF and SNR curves computed for your instrument, and to the simulation inputs." },
  "onb.s9": { fr: "Déplacez le curseur sur l'image pour comparer l'image source (à gauche) et l'image simulée par votre instrument (à droite).", en: "Move the slider across the image to compare the source image (left) with the image simulated through your instrument (right)." },
  "onb.finish.title": { fr: "Première simulation terminée !", en: "First simulation complete!" },
  "onb.finish.text": { fr: "Vous pouvez maintenant explorer librement les fonctionnalités de Nysa et lancer d'autres simulations.", en: "You can now freely explore Nysa's features and run more simulations." },
  "onb.finish.btn": { fr: "Terminer le tutoriel", en: "Finish the tutorial" },
  "settings.tour.label": { fr: "Tutoriel", en: "Tutorial" },
  "settings.tour.btn": { fr: "Revoir le tutoriel", en: "Replay the tutorial" },
  "demo.h1":             { fr: "Simulateur d'imagerie <span class=\"cool\">multispectrale</span>",
                           en: "<span class=\"cool\">Multispectral</span> imaging simulator" },

  // ---------------- bandeau bêta (beta.js) ----------------
  "beta.chip":           { fr: "BÊTA", en: "BETA" },
  "beta.text":           { fr: "Nysa est en phase d'essai : certaines fonctions peuvent encore évoluer.",
                           en: "Nysa is in beta: some features may still change." },
  "beta.feedback":       { fr: "Une remarque ?", en: "Any feedback?" },

  // ---------------- fenêtre d'aide (aide.js) ----------------
  "help.general.title":  { fr: "Besoin d'aide ?", en: "Need help?" },
  "help.general.line1":  { fr: "Une question, un blocage, un résultat qui vous surprend ? Écrivez à l'adresse ci-dessous.",
                           en: "A question, a blocker, a result that surprises you? Write to the address below." },
  "help.general.line2":  { fr: "Vous pouvez également demander un accompagnement pour configurer votre premier instrument.",
                           en: "You can also ask for hands-on support to configure your first instrument." },
  "help.instrument.title": { fr: "Besoin d'aide pour configurer votre instrument ?",
                             en: "Need help configuring your instrument?" },
  "help.instrument.line1": { fr: "Je peux vous accompagner pendant une à deux heures pour construire votre première configuration dans Nysa.",
                             en: "I can work with you for an hour or two to build your first configuration in Nysa." },
  "help.instrument.line2": { fr: "Cet accompagnement est proposé à la demande : il n'est pas nécessaire pour utiliser le simulateur.",
                             en: "This support is available on request: it is not required to use the simulator." },
  "help.write":          { fr: "Écrire à {email}", en: "Email {email}" },
  "help.close":          { fr: "Fermer", en: "Close" },

  // ---------------- erreurs d'authentification (supabase-client.js) ----------------
  "auth.err.credentials": { fr: "E-mail ou mot de passe incorrect.", en: "Incorrect email or password." },
  "auth.err.exists":      { fr: "Un compte existe déjà avec cette adresse e-mail.",
                            en: "An account already exists with this email address." },
  "auth.err.pwd_short":   { fr: "Le mot de passe doit faire au moins 6 caractères.",
                            en: "The password must be at least 6 characters long." },
  "auth.err.email":       { fr: "Adresse e-mail invalide.", en: "Invalid email address." },
  "auth.err.unconfirmed": { fr: "Confirmez d'abord votre adresse e-mail (lien envoyé à l'inscription) avant de vous connecter.",
                            en: "Please confirm your email address first (link sent at sign-up) before signing in." },
  "auth.err.other":       { fr: "Une erreur est survenue : {msg}", en: "An error occurred: {msg}" },

  // ---------------- commun à l'espace connecté ----------------
  "common.close":        { fr: "Fermer", en: "Close" },
  "common.deleting":     { fr: "Suppression…", en: "Deleting…" },
  "common.error_msg":    { fr: "Erreur : {msg}", en: "Error: {msg}" },
  "time.today":          { fr: "aujourd'hui", en: "today" },
  "time.yesterday":      { fr: "hier", en: "yesterday" },
  "time.days_ago":       { fr: "il y a {n} jours", en: "{n} days ago" },

  // menu de gauche et barre du haut
  "nav.instruments":     { fr: "Instruments", en: "Instruments" },
  "nav.platform":        { fr: "Plateforme", en: "Platform" },
  "nav.simulations":     { fr: "Simulations", en: "Simulations" },
  "nav.results":         { fr: "Résultats", en: "Results" },
  "nav.soon":            { fr: "à venir", en: "soon" },            // menu étroit : « coming soon » passait sur deux lignes
  "common.coming_soon":  { fr: "à venir", en: "coming soon" },
  "nav.help":            { fr: "Aide", en: "Help" },
  "nav.settings":        { fr: "Paramètres", en: "Settings" },
  "top.signout":         { fr: "Se déconnecter", en: "Sign out" },

  // scènes (le nom français est celui enregistré avec chaque résultat)
  "scene.Ville":         { fr: "Ville", en: "City" },
  "scene.Avion":         { fr: "Avion", en: "Aircraft" },
  "scene.Port":          { fr: "Port", en: "Port" },

  // types d'instrument

  // ---------------- espace personnel (espace-personnel.html) ----------------
  "home.doc_title":      { fr: "Espace personnel | Nysa", en: "My workspace | Nysa" },
  "home.eyebrow":        { fr: "Instruments", en: "Instruments" },
  "home.h1":             { fr: "Mes instruments", en: "My instruments" },
  "home.sub":            { fr: "Créez, configurez et gérez vos instruments d'imagerie.",
                           en: "Create, configure and manage your imaging instruments." },
  "home.create":         { fr: "+ Créer un instrument", en: "+ Create instrument" },
  "home.activity":       { fr: "Activité récente", en: "Recent activity" },
  "home.doc":            { fr: "Documentation", en: "Documentation" },
  "home.hero.h2a":       { fr: "Analysez la performance de vos", en: "Analyze the performance of your" },
  "home.hero.h2b":       { fr: "instruments d'imagerie", en: "imaging instruments" },
  "home.hero.p":         { fr: "Créez vos instruments, configurez vos scénarios et obtenez des métriques détaillées sur la qualité de vos images.",
                           en: "Create your instruments, configure your scenarios and get detailed metrics on the quality of your images." },
  "home.hero.link":      { fr: "Voir les hypothèses physiques du modèle →", en: "See the model's physical assumptions →" },
  "home.confirm.delete_one":  { fr: "Supprimer l'instrument « {name} » ? Il peut être restauré sur demande pendant 30 jours.",
                                en: "Delete the instrument “{name}”? It can be restored on request for 30 days." },
  "home.prompt.rename":  { fr: "Nouveau nom :", en: "New name:" },
  "home.copy_suffix":    { fr: " (copie)", en: " (copy)" },
  "home.err.delete":     { fr: "La suppression a échoué : {msg}", en: "Deletion failed: {msg}" },
  "home.err.rename":     { fr: "Le renommage a échoué : {msg}", en: "Renaming failed: {msg}" },
  "home.err.duplicate":  { fr: "La duplication a échoué.", en: "Duplication failed." },
  "home.err.duplicate_msg": { fr: "La duplication a échoué : {msg}", en: "Duplication failed: {msg}" },

  // cartes d'instrument
  "home.search.ph":      { fr: "Rechercher un instrument…", en: "Search for an instrument…" },
  "home.filter.status":  { fr: "Filtrer par état", en: "Filter by status" },
  "home.filter.all":     { fr: "Tous les instruments", en: "All instruments" },
  "home.filter.complete": { fr: "Complets", en: "Complete" },
  "home.filter.draft":   { fr: "Brouillons", en: "Drafts" },
  "home.count_one":      { fr: "{n} instrument", en: "{n} instrument" },
  "home.count_many":     { fr: "{n} instruments", en: "{n} instruments" },
  "inst.nomatch":        { fr: "Aucun instrument ne correspond à ces filtres.", en: "No instrument matches these filters." },
  "inst.empty.title":    { fr: "Aucun instrument", en: "No instrument yet" },
  "inst.empty.sub":      { fr: "Créez votre premier instrument pour commencer.", en: "Create your first instrument to get started." },
  "inst.missing":        { fr: "Il manque : {list}", en: "Missing: {list}" },
  "inst.draft.desc":     { fr: "Instrument à compléter avant de pouvoir lancer une simulation.",
                           en: "Complete this instrument before you can run a simulation." },
  "inst.configured":     { fr: "Instrument configuré.", en: "Instrument configured." },
  "inst.badge.draft":    { fr: "Brouillon", en: "Draft" },
  "inst.menu.options":   { fr: "Options", en: "Options" },
  "inst.menu.rename":    { fr: "Renommer", en: "Rename" },
  "inst.menu.duplicate": { fr: "Dupliquer", en: "Duplicate" },
  "inst.menu.delete":    { fr: "Supprimer", en: "Delete" },
  "inst.config.incomplete": { fr: "Configuration incomplète", en: "Configuration incomplete" },
  "inst.config.complete":   { fr: "Configuration complète", en: "Configuration complete" },
  "inst.modified":       { fr: "Modifié le {date}", en: "Modified {date}" },
  "inst.created":        { fr: "Créé le {date}", en: "Created {date}" },
  "inst.open":           { fr: "Ouvrir →", en: "Open →" },
  "inst.complete_cta":   { fr: "Compléter →", en: "Complete →" },

  // activité récente
  "activity.inst_saved":   { fr: "Instrument enregistré", en: "Instrument saved" },
  "activity.result_saved": { fr: "Résultat sauvegardé ({scene})", en: "Result saved ({scene})" },
  "activity.inst_deleted": { fr: " · instrument supprimé", en: " · instrument deleted" },
  "activity.none":         { fr: "Aucune activité ces {n} derniers jours", en: "No activity in the last {n} days" },

  // paramètres
  "settings.title":         { fr: "Paramètres", en: "Settings" },
  "settings.rail.account":  { fr: "Compte", en: "Account" },
  "settings.rail.pwd":      { fr: "Mot de passe", en: "Password" },
  "settings.rail.sub":      { fr: "Abonnement", en: "Subscription" },
  "settings.rail.delete":   { fr: "Suppression", en: "Delete account" },
  "settings.account.h":     { fr: "Compte", en: "Account" },
  "settings.account.p":     { fr: "Vos informations personnelles et votre adresse e-mail", en: "Your personal information and email address" },
  "settings.account.email": { fr: "E-mail", en: "Email" },
  "settings.account.since": { fr: "Membre depuis", en: "Member since" },
  "settings.pwd.h":         { fr: "Mot de passe", en: "Password" },
  "settings.pwd.p":         { fr: "Modifiez votre mot de passe pour sécuriser votre compte", en: "Change your password to keep your account secure" },
  "settings.pwd.new":       { fr: "Nouveau mot de passe", en: "New password" },
  "settings.pwd.ph":        { fr: "8 caractères minimum", en: "At least 8 characters" },
  "settings.pwd.confirm":   { fr: "Confirmer le nouveau mot de passe", en: "Confirm new password" },
  "settings.pwd.btn":       { fr: "Mettre à jour le mot de passe", en: "Update password" },
  "pwd.min":                { fr: "8 caractères minimum.", en: "At least 8 characters." },
  "pwd.mismatch":           { fr: "Les mots de passe ne correspondent pas.", en: "The passwords do not match." },
  "pwd.updating":           { fr: "Mise à jour…", en: "Updating…" },
  "pwd.done":               { fr: "Mot de passe mis à jour.", en: "Password updated." },
  "settings.sub.h":         { fr: "Abonnement", en: "Subscription" },
  "settings.sub.p":         { fr: "Votre offre et vos options d'abonnement", en: "Your plan and subscription options" },
  "settings.del.h":         { fr: "Supprimer mon compte", en: "Delete my account" },
  "settings.del.p":         { fr: "Effacement immédiat et définitif de toutes vos données", en: "Immediate and permanent erasure of all your data" },
  "settings.del.li1":       { fr: "Vos instruments, vos résultats et leurs images sont effacés immédiatement, sans récupération possible.",
                              en: "Your instruments, your results and their images are erased immediately, with no possible recovery." },
  "settings.del.li2":       { fr: "Votre abonnement est arrêté tout de suite : aucun nouveau prélèvement, et la période déjà payée n'est pas remboursée.",
                              en: "Your subscription is stopped right away: no further charge, and the period already paid is not refunded." },
  "settings.del.li3":       { fr: "Vos factures restent conservées par notre prestataire de paiement (Stripe), comme l'exigent nos obligations comptables.",
                              en: "Your invoices remain stored by our payment provider (Stripe), as required by our accounting obligations." },
  "settings.del.label":     { fr: "Pour confirmer, tapez {word}", en: "To confirm, type {word}" },
  "settings.del.word":      { fr: "SUPPRIMER", en: "DELETE" },
  "settings.del.btn":       { fr: "Supprimer définitivement mon compte", en: "Permanently delete my account" },
  "settings.del.busy":      { fr: "Suppression en cours, ne fermez pas cette page…", en: "Deletion in progress, do not close this page…" },
  "settings.del.fail":      { fr: "La suppression n'a pas pu aller au bout. Votre compte existe toujours : réessayez, et contactez-nous si l'erreur persiste.",
                              en: "The deletion could not be completed. Your account still exists: try again, and contact us if the error persists." },

  // abonnement et accès bêta
  "sub.badge.beta":        { fr: "Bêta", en: "Beta" },
  "sub.beta.name":         { fr: "Accès bêta", en: "Beta access" },
  "sub.beta.desc":         { fr: "Gratuit pendant la phase d'essai", en: "Free during the trial phase" },
  "sub.beta.until":        { fr: "Votre accès bêta est actif jusqu'au {date}.", en: "Your beta access is active until {date}." },
  "sub.beta.active":       { fr: "Votre accès bêta est actif.", en: "Your beta access is active." },
  "sub.beta.ended.name":   { fr: "Accès bêta terminé", en: "Beta access ended" },
  "sub.beta.ended.desc":   { fr: "La phase d'essai est terminée", en: "The trial phase is over" },
  "sub.beta.ended.note":   { fr: "Votre accès bêta a pris fin le {date}.", en: "Your beta access ended on {date}." },
  "sub.status.active":     { fr: "Actif", en: "Active" },
  "sub.status.inactive":   { fr: "Inactif", en: "Inactive" },
  "sub.badge.individual":  { fr: "Individuel", en: "Individual" },
  "sub.plan.individual":   { fr: "Plan Individuel", en: "Individual plan" },
  "sub.full":              { fr: "Accès complet", en: "Full access" },
  "sub.cancelled_until":   { fr: "Résilié : expire le {date}.", en: "Cancelled: expires on {date}." },
  "sub.renews":            { fr: "Renouvellement le {date}.", en: "Renews on {date}." },
  "sub.manage":            { fr: "Gérer mon abonnement", en: "Manage my subscription" },
  "sub.pending":           { fr: "Paiement en attente", en: "Payment pending" },
  "sub.failed":            { fr: "Paiement échoué", en: "Payment failed" },
  "sub.update_note":       { fr: "Mettez à jour votre moyen de paiement pour conserver l'accès.", en: "Update your payment method to keep your access." },
  "sub.update_btn":        { fr: "Mettre à jour le paiement", en: "Update payment" },
  "sub.badge.free":        { fr: "Gratuit", en: "Free" },
  "sub.none":              { fr: "Aucun abonnement", en: "No subscription" },
  "sub.none.desc":         { fr: "Passez au plan Individuel pour accéder au simulateur complet", en: "Switch to the Individual plan to access the full simulator" },
  "sub.ended":             { fr: "Votre abonnement a pris fin le {end}. Sans réabonnement, votre compte et vos données seront supprimés le {del}.",
                             en: "Your subscription ended on {end}. Unless you resubscribe, your account and your data will be deleted on {del}." },
  "sub.subscribe":         { fr: "S'abonner", en: "Subscribe" },
  "sub.redirect":          { fr: "Redirection…", en: "Redirecting…" },
  "sub.activating":        { fr: "Activation en cours…", en: "Activating…" },
  "sub.paid_wait":         { fr: "Paiement enregistré. L'activation peut prendre quelques instants : rechargez la page.",
                             en: "Payment recorded. Activation may take a few moments: reload the page." },
  "sub.pay_fail":          { fr: "Impossible d'ouvrir la page de paiement. Réessayez dans un instant.",
                             en: "Unable to open the payment page. Please try again in a moment." },

  // ---------------- libellés de champs (communs aux pages) ----------------
  "field.scene":         { fr: "Scène", en: "Scene" },
  "field.D":             { fr: "Diamètre de pupille", en: "Pupil diameter" },
  "field.I":             { fr: "iFoV", en: "iFoV" },
  "field.E":             { fr: "Obscuration centrale", en: "Central obscuration" },
  "field.T":             { fr: "Transmission optique", en: "Optical transmission" },
  "field.W":             { fr: "WFE RMS", en: "WFE RMS" },
  "field.PX":            { fr: "Largeur pixel", en: "Pixel pitch" },
  "field.NSUP":          { fr: "Nombre de supports", en: "Number of spider vanes" },
  "field.ESUP":          { fr: "Épaisseur des supports", en: "Spider vane thickness" },
  "field.R":             { fr: "Bruit de lecture", en: "Read noise" },
  "field.P":             { fr: "PRNU", en: "PRNU" },
  "field.K":             { fr: "Courant d'obscurité", en: "Dark current" },
  "field.FW":            { fr: "Full well", en: "Full well" },
  "field.QE":            { fr: "Rendement quantique", en: "Quantum efficiency" },
  "field.ADC":           { fr: "Résolution ADC", en: "ADC resolution" },
  "field.H":             { fr: "Altitude", en: "Altitude" },
  "field.S":             { fr: "Élévation solaire", en: "Sun elevation" },
  "field.TI":            { fr: "Temps d'intégration", en: "Integration time" },
  "field.TDI":           { fr: "Étages TDI", en: "TDI stages" },
  "field.wfe_case":      { fr: "Cas WFE", en: "WFE case" },
  "field.perfoCsv":      { fr: "Cas WFE (CSV Zernike)", en: "WFE case (Zernike CSV)" },
  "field.perfoCsvAlign": { fr: "Cadrage du cas WFE", en: "WFE case alignment" },
  "field.perfoCsvConvention": { fr: "Convention Zernike du cas WFE", en: "Zernike convention of the WFE case" },
  "field.qeSpectral":    { fr: "Courbe QE(λ)", en: "QE(λ) curve" },

  // ---------------- messages renvoyés par le serveur de simulation ----------------
  "api.server_error":    { fr: "Erreur serveur ({status})", en: "Server error ({status})" },
  "api.auth":            { fr: "Authentification requise.", en: "Authentication required." },
  "api.token":           { fr: "Session expirée : reconnectez-vous.", en: "Session expired: please sign in again." },
  "api.sub_check":       { fr: "Impossible de vérifier l'abonnement. Réessayez dans un instant.", en: "Unable to verify the subscription. Please try again in a moment." },
  "api.sub_none":        { fr: "Aucun abonnement actif sur ce compte.", en: "No active subscription on this account." },
  "api.sub_inactive":    { fr: "Abonnement inactif : le simulateur complet nécessite un abonnement actif.", en: "Inactive subscription: the full simulator requires an active subscription." },
  "api.sub_expired":     { fr: "Abonnement ou période d'essai expiré.", en: "Subscription or trial period expired." },
  "api.rate_ip":         { fr: "Trop de simulations depuis cette adresse. Réessayez plus tard.", en: "Too many simulations from this address. Please try again later." },
  "api.rate_account":    { fr: "Trop de simulations depuis ce compte. Réessayez plus tard.", en: "Too many simulations from this account. Please try again later." },
  "api.rate_requests":   { fr: "Trop de requêtes depuis ce compte. Réessayez plus tard.", en: "Too many requests from this account. Please try again later." },
  "api.electronics":     { fr: "Électronique non renseignée : ouvrez l'instrument et complétez le bloc Électronique.", en: "Electronics not filled in: open the instrument and complete the Electronics block." },

  // ---------------- page Simulations (simulations.html) ----------------
  "common.back":         { fr: "← Retour", en: "← Back" },
  "common.previous":     { fr: "← Précédent", en: "← Previous" },
  "common.next":         { fr: "Suivant →", en: "Next →" },
  "common.colon":        { fr: " : ", en: ": " },
  "sim.doc_title":       { fr: "Nouvelle simulation | Nysa", en: "New simulation | Nysa" },
  "sim.eyebrow":         { fr: "Simulations", en: "Simulations" },
  "sim.h1":              { fr: "Nouvelle simulation", en: "New simulation" },
  "sim.sub":             { fr: "Configurez votre scène, votre instrument et vos conditions d'acquisition, puis lancez la simulation.",
                           en: "Set up your scene, your instrument and your acquisition conditions, then run the simulation." },
  "sim.steps.scene":     { fr: "Scène", en: "Scene" },
  "sim.steps.instrument":{ fr: "Instrument", en: "Instrument" },
  "sim.steps.conditions":{ fr: "Conditions d'acquisition", en: "Acquisition conditions" },
  "sim.steps.run":       { fr: "Lancement", en: "Run" },
  "sim.step1.title":     { fr: "1. Scène", en: "1. Scene" },
  "sim.step1.intro":     { fr: "Choisissez une image dans la bibliothèque de scènes.", en: "Choose an image from the scene library." },
  "sim.step2.title":     { fr: "2. Instrument", en: "2. Instrument" },
  "sim.step2.intro":     { fr: "Choisissez l'instrument à utiliser pour cette simulation.", en: "Choose the instrument to use for this simulation." },
  "sim.step3.title":     { fr: "3. Conditions d'acquisition", en: "3. Acquisition conditions" },
  "sim.step3.intro":     { fr: "Définissez le scénario d'acquisition de la scène.", en: "Define the acquisition scenario for the scene." },
  "sim.view_angle":      { fr: "Angle de visée", en: "Viewing angle" },
  "sim.wfe.simplified":  { fr: "Simplifié (RMS)", en: "Simplified (RMS)" },
  "sim.wfe.file_suffix": { fr: " (fichier)", en: " (file)" },
  "sim.atm.summary":     { fr: "Atmosphère (paramètres avancés)", en: "Atmosphere (advanced settings)" },
  "sim.atm.profile":     { fr: "Profil atmosphérique", en: "Atmospheric profile" },
  "sim.atm.p.tropical":  { fr: "Tropical", en: "Tropical" },
  "sim.atm.p.mls":       { fr: "Latitudes moyennes, été", en: "Midlatitude summer" },
  "sim.atm.p.mlw":       { fr: "Latitudes moyennes, hiver", en: "Midlatitude winter" },
  "sim.atm.p.sas":       { fr: "Subarctique, été", en: "Subarctic summer" },
  "sim.atm.p.saw":       { fr: "Subarctique, hiver", en: "Subarctic winter" },
  "sim.atm.p.us62":      { fr: "US Standard 1962", en: "US Standard 1962" },
  "sim.atm.p.custom":    { fr: "Personnalisé", en: "Custom" },
  "sim.atm.aero_type":   { fr: "Type d'aérosols", en: "Aerosol type" },
  "sim.atm.a.continental": { fr: "Continental", en: "Continental" },
  "sim.atm.a.maritime":  { fr: "Maritime", en: "Maritime" },
  "sim.atm.a.urban":     { fr: "Urbain", en: "Urban" },
  "sim.atm.a.desert":    { fr: "Désertique", en: "Desert" },
  "sim.atm.water":       { fr: "Vapeur d'eau", en: "Water vapor" },
  "sim.atm.ozone":       { fr: "Ozone", en: "Ozone" },
  "sim.atm.aero_load":   { fr: "Charge en aérosols", en: "Aerosol load" },
  "sim.atm.l.visibility":{ fr: "Visibilité (km)", en: "Visibility (km)" },
  "sim.atm.l.aot":       { fr: "Épaisseur optique 550 nm", en: "Optical depth at 550 nm" },
  "sim.atm.value":       { fr: "Valeur", en: "Value" },
  "sim.atm.ph.water":    { fr: "0 à 10", en: "0 to 10" },
  "sim.atm.ph.ozone":    { fr: "0 à 1", en: "0 to 1" },
  "sim.atm.ph.vis":      { fr: "23 km (défaut)", en: "23 km (default)" },
  "sim.atm.ph.aot":      { fr: "ex. 0.2", en: "e.g. 0.2" },
  "sim.diag.aria":       { fr: "Géométrie d'acquisition", en: "Acquisition geometry" },
  "sim.diag.atmosphere": { fr: "ATMOSPHÈRE", en: "ATMOSPHERE" },
  "sim.diag.surface":    { fr: "SURFACE", en: "SURFACE" },
  "sim.diag.nadir":      { fr: "NADIR", en: "NADIR" },
  "sim.diag.target":     { fr: "CIBLE", en: "TARGET" },
  "sim.diag.sun_elev":   { fr: "ÉLÉVATION SOLAIRE", en: "SUN ELEVATION" },
  "sim.diag.altitude":   { fr: "ALTITUDE", en: "ALTITUDE" },
  "sim.diag.sun":        { fr: "SOLEIL", en: "SUN" },
  "sim.diag.illumination": { fr: "ÉCLAIREMENT", en: "ILLUMINATION" },
  "sim.diag.los":        { fr: "VISÉE / NADIR", en: "LINE OF SIGHT / NADIR" },
  "sim.inst.preview":    { fr: "Instrument (aperçu)", en: "Instrument (preview)" },
  "sim.inst.none":       { fr: "Aucun instrument enregistré.", en: "No instrument saved yet." },
  "sim.inst.to_complete":{ fr: "Instrument à compléter", en: "Instrument to complete" },
  "sim.inst.to_complete_short": { fr: "à compléter", en: "to complete" },
  "sim.inst.fields_one": { fr: "{n} champ à renseigner", en: "{n} field to fill in" },
  "sim.inst.fields_many":{ fr: "{n} champs à renseigner", en: "{n} fields to fill in" },
  "sim.sum.title":       { fr: "Résumé de la configuration", en: "Configuration summary" },
  "sim.sum.instrument":  { fr: "Instrument", en: "Instrument" },
  "sim.sum.conditions":  { fr: "Conditions", en: "Conditions" },
  "sim.sum.params":      { fr: "Résumé des paramètres", en: "Parameter summary" },
  "sim.sum.resolution":  { fr: "Résolution", en: "Resolution" },
  "sim.sum.wfe_line":    { fr: "Cas WFE : {name}", en: "WFE case: {name}" },
  "sim.btn.run":         { fr: "▶ Lancer la simulation", en: "▶ Run simulation" },
  "sim.btn.subscribe_to_run": { fr: "🔒 S'abonner pour lancer", en: "🔒 Subscribe to run" },
  "sim.btn.fix_payment": { fr: "🔒 Régulariser le paiement", en: "🔒 Fix payment" },
  "sim.stop":            { fr: "⏹ Interrompre", en: "⏹ Stop" },
  "sim.eta":             { fr: "Temps estimé restant :", en: "Estimated time remaining:" },
  "sim.eta.running":     { fr: "calcul en cours (peut prendre 1-2 minutes)", en: "computing (may take 1–2 minutes)" },
  "sim.eta.done":        { fr: "terminé", en: "done" },
  "sim.pct.failed":      { fr: "échec", en: "failed" },
  "sim.status.running":  { fr: "Simulation en cours", en: "Simulation running" },
  "sim.status.done":     { fr: "Simulation terminée", en: "Simulation complete" },
  "sim.status.stopped":  { fr: "Simulation interrompue", en: "Simulation stopped" },
  "sim.status.failed":   { fr: "Échec de la simulation", en: "Simulation failed" },
  "sim.log.started":     { fr: "Simulation lancée.",
                           en: "Simulation started." },
  "sim.log.still":       { fr: "Calcul toujours en cours…", en: "Still computing…" },
  "sim.log.done":        { fr: "Simulation terminée.", en: "Simulation complete." },
  "sim.log.stopped":     { fr: "Simulation interrompue par l'utilisateur.",
                           en: "Simulation stopped by the user." },
  "sim.err.session":     { fr: "Session expirée : reconnectez-vous puis relancez la simulation.", en: "Session expired: sign in again, then rerun the simulation." },
  "sim.save.saving":     { fr: "Sauvegarde du résultat…", en: "Saving the result…" },
  "sim.save.done":       { fr: "Résultat sauvegardé.", en: "Result saved." },
  "sim.save.view":       { fr: "📊 Voir les résultats", en: "📊 View results" },
  "sim.save.fail":       { fr: "Échec de la sauvegarde automatique : {msg}", en: "Automatic save failed: {msg}" },
  "sim.save.limit":      { fr: "Limite de résultats sauvegardés atteinte.", en: "You have reached the limit of saved results. Delete one to save this result." },
  "sim.save.retry":      { fr: "Réessayer la sauvegarde", en: "Retry saving" },

  // fenêtre et bandeau d'abonnement
  "paywall.eyebrow":       { fr: "Simulateur complet", en: "Full simulator" },
  "paywall.ready_eyebrow": { fr: "Votre simulation est prête", en: "Your simulation is ready" },
  "paywall.title":         { fr: "Voyez l'image que produit votre instrument", en: "See the image your instrument produces" },
  "paywall.title.pending": { fr: "Votre paiement n'a pas abouti", en: "Your payment did not go through" },
  "paywall.generic":       { fr: "Vos instruments et vos réglages sont prêts. L'abonnement lance la simulation et vous donne l'image, mesurée de bout en bout.",
                             en: "Your instruments and settings are ready. The subscription runs the simulation and gives you the image, measured end to end." },
  "paywall.pending":       { fr: "Votre abonnement est suspendu tant que le paiement n'est pas régularisé. Mettez à jour votre moyen de paiement pour relancer vos simulations.",
                             en: "Your subscription is suspended until the payment is settled. Update your payment method to run your simulations again." },
  "paywall.ready":         { fr: "{inst} sur la scène {scene} : tout est réglé, il ne reste qu'à lancer. L'abonnement vous donne l'image, mesurée de bout en bout.",
                             en: "{inst} on the {scene} scene: everything is set, all that remains is to run it. The subscription gives you the image, measured end to end." },
  "paywall.ready_alt":     { fr: "{inst} sur la scène {scene}, à {alt} km : tout est réglé, il ne reste qu'à lancer. L'abonnement vous donne l'image, mesurée de bout en bout.",
                             en: "{inst} on the {scene} scene, at {alt} km: everything is set, all that remains is to run it. The subscription gives you the image, measured end to end." },
  "paywall.li1":           { fr: "La chaîne physique complète, sur vos propres paramètres", en: "The full physical chain, on your own parameters" },
  "paywall.li2":           { fr: "Image simulée, MTF et SNR par bande", en: "Simulated image, MTF and SNR per band" },
  "paywall.li3":           { fr: "Jusqu'à 20 instruments et 20 résultats sauvegardés", en: "Up to 20 instruments and 20 saved results" },
  "paywall.later":         { fr: "Plus tard", en: "Later" },
  "paywall.continue":      { fr: "Continuer sans lancer de simulation", en: "Continue without running a simulation" },
  "paywall.banner":        { fr: "Vous pouvez préparer votre simulation ; l'abonnement permet de la lancer.", en: "You can prepare your simulation; a subscription lets you run it." },
  "paywall.banner.pending":{ fr: "Paiement en attente : vos simulations sont suspendues.", en: "Payment pending: your simulations are suspended." },

  // ---------------- blocs d'instrument et bandes (communs) ----------------
  "block.optics":        { fr: "Optique", en: "Optics" },
  "block.detector":      { fr: "Détecteur", en: "Detector" },
  "block.electronics":   { fr: "Électronique", en: "Electronics" },
  "band.RGB":            { fr: "RGB", en: "RGB" },
  "band.Rouge":          { fr: "Rouge", en: "Red" },
  "band.Vert":           { fr: "Vert", en: "Green" },
  "band.Bleu":           { fr: "Bleu", en: "Blue" },

  // ---------------- page Résultats (resultats.html) ----------------
  "res.doc_title":       { fr: "Résultats | Nysa", en: "Results | Nysa" },
  "res.eyebrow":         { fr: "Résultats", en: "Results" },
  "res.h1":              { fr: "Mes résultats", en: "My results" },
  "res.sub":             { fr: "Retrouvez vos simulations sauvegardées.", en: "Find your saved simulations." },
  "res.search.ph":       { fr: "Rechercher un résultat, un instrument…", en: "Search for a result, an instrument…" },
  "res.filter.all_scenes": { fr: "Toutes les scènes", en: "All scenes" },
  "res.filter.all_inst": { fr: "Tous les instruments", en: "All instruments" },
  "res.filter.clear":    { fr: "Effacer les filtres", en: "Clear filters" },
  "res.sort.date":       { fr: "Date", en: "Date" },
  "res.sort.mtf":        { fr: "MTF à Nyquist", en: "MTF at Nyquist" },
  "res.sort.snr":        { fr: "SNR", en: "SNR" },
  "res.count_one":       { fr: "{n} résultat", en: "{n} result" },
  "res.count_many":      { fr: "{n} résultats", en: "{n} results" },
  "res.count_of":        { fr: "{shown} sur {total}", en: "{shown} of {total}" },
  "res.load_error":      { fr: "Erreur de chargement. Réessayez plus tard.", en: "Loading error. Please try again later." },
  "res.empty.a":         { fr: "Aucun résultat sauvegardé pour l'instant. ", en: "No saved result yet. " },
  "res.empty.link":      { fr: "Lancez une simulation", en: "Run a simulation" },
  "res.empty.b":         { fr: " pour en créer un.", en: " to create one." },
  "res.inst_gone":       { fr: "Instrument supprimé", en: "Instrument deleted" },
  "res.inputs_closed":   { fr: "Entrées ▾", en: "Inputs ▾" },
  "res.inputs_open":     { fr: "Entrées ▴", en: "Inputs ▴" },
  "res.open_full":       { fr: "Ouvrir le résultat complet", en: "Open the full result" },
  "res.prompt.name":     { fr: "Nom de la simulation :", en: "Simulation name:" },
  "res.confirm.delete":  { fr: "Supprimer définitivement ce résultat ({scene}) ? Cette action est irréversible.",
                           en: "Permanently delete this result ({scene})? This action cannot be undone." },
  // détail des entrées d'un résultat
  "res.in.gsd":          { fr: "Pas au sol", en: "GSD" },
  "res.in.simplified":   { fr: "simplifié", en: "simplified" },
  "res.in.supports":     { fr: "Supports", en: "Spider vanes" },
  "res.in.transmission": { fr: "Transmission", en: "Transmission" },
  "res.in.curve":        { fr: "courbe, {n} points", en: "curve, {n} points" },
  "res.in.dsnu_tref":    { fr: "Temps de réf. DSNU", en: "DSNU ref. time" },
  "res.in.mode":         { fr: "Mode", en: "Mode" },
  "res.in.mode.detailed":   { fr: "détaillé", en: "detailed" },
  "res.in.mode.datasheet":  { fr: "datasheet", en: "datasheet" },
  "res.in.mode.full_scale": { fr: "pleine échelle = full well", en: "full scale = full well" },
  "res.in.cvf":          { fr: "Facteur de conversion", en: "Conversion factor" },
  "res.in.pga":          { fr: "Gain PGA", en: "PGA gain" },
  "res.in.adc_range":    { fr: "Plage ADC", en: "ADC range" },
  "res.in.cwf":          { fr: "Gain global", en: "Overall gain" },
  "res.in.black":        { fr: "Niveau noir", en: "Black level" },
  "res.in.tdi_acc":      { fr: "Accumulateur TDI", en: "TDI accumulator" },
  // page d'un résultat
  "res.back":            { fr: "← Retour aux résultats", en: "← Back to results" },
  "res.title_default":   { fr: "Résultat", en: "Result" },
  "res.tab.image":       { fr: "Image", en: "Image" },
  "res.tab.mtf":         { fr: "Graphes MTF", en: "MTF plots" },
  "res.tab.snr":         { fr: "Graphes SNR", en: "SNR plots" },
  "res.tab.inputs":      { fr: "Entrées", en: "Inputs" },
  "res.img.source":      { fr: "Image source", en: "Source image" },
  "res.img.sim":         { fr: "Image simulée", en: "Simulated image" },
  "res.fullscreen":      { fr: "Plein écran", en: "Full screen" },
  "res.hint":            { fr: "Glissez sur l'image pour comparer", en: "Drag across the image to compare" },
  "res.bands":           { fr: "Bandes spectrales", en: "Spectral bands" },
  "res.display":         { fr: "Affichage", en: "Display" },
  "res.contrast":        { fr: "Contraste", en: "Contrast" },
  "res.render":          { fr: "Rendu de l'image", en: "Image rendering" },
  "res.render.none":     { fr: "Aucun (brut)", en: "None (raw)" },
  "res.render.p2p98":    { fr: "Étirement p2/p98 (netteté seulement)", en: "p2/p98 stretch (sharpness only)" },
  "res.sat":             { fr: "Afficher les pixels saturés (magenta)", en: "Show saturated pixels (magenta)" },
  "res.whitepoint":      { fr: "Choisir un point blanc sur l'image", en: "Pick a white point on the image" },
  "res.reset":           { fr: "Réinitialiser l'affichage", en: "Reset display" },
  "res.note":            { fr: "Ces réglages n'affectent que l'affichage dans ce navigateur : le téléchargement fournit l'image calculée par le serveur, en pleine résolution et sans retouche.",
                           en: "These settings only affect the display in this browser: the download provides the image computed by the server, at full resolution and unaltered." },
  "res.download":        { fr: "Télécharger l'image", en: "Download image" },
  "res.download.prefix": { fr: "resultat_", en: "result_" },
  "res.download.rgb":    { fr: "Télécharger l'image RGB", en: "Download RGB image" },
  "res.download.band":   { fr: "Télécharger la bande {band}", en: "Download {band} band" },
  "res.ent.scene_label": { fr: "Scène :", en: "Scene:" },
  "res.ent.name_label":  { fr: "Nom :", en: "Name:" },
  "res.ent.no_config":   { fr: "Aucune configuration disponible.", en: "No configuration available." },
  "res.ent.no_cond":     { fr: "Aucune condition disponible.", en: "No conditions available." },
  "res.z.label":         { fr: "Mode d'aberration", en: "Aberration mode" },
  "res.z.none":          { fr: "Aucune", en: "None" },
  "res.z.defoc":         { fr: "Défocalisation", en: "Defocus" },
  "res.z.astig":         { fr: "Astigmatisme", en: "Astigmatism" },
  "res.z.coma":          { fr: "Coma", en: "Coma" },
  "res.z.spher":         { fr: "Aberration sphérique", en: "Spherical aberration" },
  "res.z.trefo":         { fr: "Trefoil", en: "Trefoil" },
  "res.notfound.a":      { fr: "Résultat introuvable. Vérifiez le lien, ou revenez depuis ", en: "Result not found. Check the link, or go back to " },
  "res.notfound.link":   { fr: "la liste des résultats", en: "the list of results" },
  "res.no_diag":         { fr: "Aucun diagnostic disponible pour ce résultat.", en: "No diagnostics available for this result." },
  "res.snr_mean":        { fr: "SNR moyen", en: "Mean SNR" },
  "res.fill":            { fr: "Remplissage", en: "Well fill" },

  // mot de passe oublié (login.html)
  "login.legal.a":       { fr: "En créant un compte, vous acceptez les ", en: "By creating an account, you accept the " },
  "login.legal.terms":   { fr: "conditions d'essai", en: "beta terms" },
  "login.legal.b":       { fr: " et la ", en: " and the " },
  "login.legal.privacy": { fr: "politique de confidentialité", en: "privacy policy" },
  "home.trust.link":     { fr: "Politique de confidentialité →", en: "Privacy policy →" },
  "login.forgot":        { fr: "Mot de passe oublié ?", en: "Forgot your password?" },
  "login.forgot.intro":  { fr: "Saisissez l'adresse e-mail de votre compte : nous vous envoyons un lien pour choisir un nouveau mot de passe.",
                           en: "Enter the email address of your account: we will send you a link to choose a new password." },
  "login.forgot.btn":    { fr: "Envoyer le lien", en: "Send the link" },
  "login.forgot.back":   { fr: "← Retour à la connexion", en: "← Back to sign in" },
  "login.forgot.sent":   { fr: "Si un compte existe avec cette adresse, un e-mail vient d'être envoyé. Pensez à regarder dans vos courriers indésirables.",
                           en: "If an account exists with this address, an email has just been sent. Remember to check your spam folder." },
  "login.forgot.rate":   { fr: "Trop de demandes. Réessayez dans quelques minutes.", en: "Too many requests. Please try again in a few minutes." },
  "login.reset.intro":   { fr: "Choisissez votre nouveau mot de passe.", en: "Choose your new password." },
  "login.reset.btn":     { fr: "Enregistrer le mot de passe", en: "Save password" },
  "login.reset.checking":{ fr: "Vérification du lien…", en: "Checking the link…" },
  "login.reset.expired": { fr: "Ce lien n'est plus valable. Demandez un nouvel e-mail ci-dessous.", en: "This link is no longer valid. Request a new email below." },
  "login.reset.done":    { fr: "Mot de passe mis à jour. Connexion…", en: "Password updated. Signing you in…" },
  "auth.err.same_password": { fr: "Le nouveau mot de passe doit être différent de l'ancien.", en: "The new password must be different from the old one." },

  "nav.menu":            { fr: "Menu", en: "Menu" },
  "nav.menu.close":      { fr: "Fermer le menu", en: "Close menu" },

  // encadré Confidentialité et souveraineté (espace personnel)
  "home.privacy":        { fr: "Confidentialité", en: "Privacy" },
  "home.trust.h2a":      { fr: "Vos instruments et résultats restent", en: "Your instruments and results remain" },
  "home.trust.h2b":      { fr: "les vôtres", en: "yours" },
  "home.trust.li1":      { fr: "Visibles de vous seul, jamais partagés ni réutilisés.", en: "Visible only to you, never shared or reused." },
  "home.trust.li4":      { fr: "Nysa ne les consulte pas sans votre autorisation préalable.", en: "Nysa does not look at them without your prior authorization." },
  "home.trust.li2":      { fr: "Simulations calculées et données stockées en France.", en: "Simulations computed and data stored in France." },
  "home.trust.li3":      { fr: "Aucun traceur, aucune publicité, aucune mesure d'audience.", en: "No tracker, no advertising, no audience measurement." },
  "sim.inst.example":    { fr: "Exemple", en: "Example" },

  // fenêtre « quitter la page pendant un calcul » (simulations.html)
  "sim.leave.title":        { fr: "Simulation en cours", en: "Simulation in progress" },
  "sim.leave.text":         { fr: "Si vous quittez cette page, la simulation sera perdue. Vous pouvez aussi ouvrir « {page} » dans un nouvel onglet : la simulation continuera ici.",
                              en: "If you leave this page, the simulation will be lost. You can also open “{page}” in a new tab: the simulation will keep running here." },
  "sim.leave.title_saving": { fr: "Sauvegarde en cours", en: "Saving in progress" },
  "sim.leave.text_saving":  { fr: "Le résultat est en cours de sauvegarde. Si vous quittez cette page maintenant, il sera perdu. Vous pouvez aussi ouvrir « {page} » dans un nouvel onglet : la sauvegarde se terminera ici.",
                              en: "The result is being saved. If you leave this page now, it will be lost. You can also open “{page}” in a new tab: the saving will finish here." },
  "sim.leave.newtab":       { fr: "Ouvrir dans un nouvel onglet", en: "Open in a new tab" },
  "sim.leave.go":           { fr: "Quitter et perdre la simulation", en: "Leave and lose the simulation" },
  "sim.leave.go_saving":    { fr: "Quitter et perdre le résultat", en: "Leave and lose the result" },
  "sim.leave.stay":         { fr: "Rester ici", en: "Stay here" },
  "sim.leave.this_page":    { fr: "cette page", en: "this page" },
  "sim.leave.prev":         { fr: "Une simulation est en cours : revenir en arrière l'interrompra et la fera perdre. Continuer ?",
                              en: "A simulation is in progress: going back will interrupt it and you will lose it. Continue?" },
  "sim.leave.signout":      { fr: "Une simulation est en cours : vous déconnecter la fera perdre. Continuer ?",
                              en: "A simulation is in progress: signing out will lose it. Continue?" },

  // bornes des conditions d'acquisition (simulations.html)
  "sim.val.required":    { fr: "Valeur requise.", en: "Value required." },
  "sim.val.min_fmc":     { fr: "Au moins {min} µs (FMC = 1).", en: "At least {min} µs (FMC = 1)." },
  "sim.val.min":         { fr: "Au moins {min} µs.", en: "At least {min} µs." },
  "sim.val.max":         { fr: "Au plus {max} µs.", en: "At most {max} µs." },
  "sim.val.ti_unreachable": { fr: "Pour cet instrument à cette altitude, le temps minimal (FMC = 1) est de {min} µs, au-dessus de la limite de {max} µs.",
                              en: "For this instrument at this altitude, the minimum time (FMC = 1) is {min} µs, above the {max} µs limit." },
  // administration (simulations.html, resultats.html) : visibles du seul compte administrateur
  "api.admin_only":      { fr: "Accès réservé à l'administrateur.", en: "Access reserved for the administrator." },
  "sim.admin.title":     { fr: "Administration", en: "Administration" },
  "sim.admin.note":      { fr: "Réservé à l'administrateur. Un fichier JSON chargé remplace l'instrument et les conditions : il est fusionné sur le modèle du serveur, sans contrôle de plausibilité. L'instrument choisi à l'étape 2 sert seulement à rattacher le résultat.",
                           en: "Administrator only. A loaded JSON file replaces the instrument and the conditions: it is merged onto the server template, without plausibility checks. The instrument chosen in step 2 only serves to attach the result." },
  "sim.admin.json":      { fr: "Paramètres (JSON)", en: "Parameters (JSON)" },
  "sim.admin.csv":       { fr: "WFE Zernike (CSV)", en: "Zernike WFE (CSV)" },
  "sim.admin.state":     { fr: "Mode admin actif : {name}", en: "Admin mode on: {name}" },
  "sim.admin.err_json":  { fr: "JSON invalide : {msg}", en: "Invalid JSON: {msg}" },
  "sim.admin.err_obj":   { fr: "Le JSON doit être un objet de paramètres.", en: "The JSON must be a parameters object." },
  "sim.admin.err_size":  { fr: "Fichier trop volumineux (maximum {max}).", en: "File too large (maximum {max})." },
  "sim.admin.clear":     { fr: "Retirer", en: "Remove" },
  "sim.admin.srv_logs":  { fr: "Journaux du serveur", en: "Server logs" },
  // signalement d'un résultat (resultats.html)
  // export / import d'un résultat
  "res.export.btn":       { fr: "Exporter", en: "Export" },
  "res.export.busy":      { fr: "Export…", en: "Exporting…" },
  "res.export.fail":      { fr: "L'export a échoué : {msg}", en: "Export failed: {msg}" },
  "res.import.btn":       { fr: "Importer un résultat", en: "Import a result" },
  "res.import.busy":      { fr: "Import en cours…", en: "Importing…" },
  "res.import.done":      { fr: "Résultat importé.", en: "Result imported." },
  "res.import.err_format":{ fr: "Ce fichier n'est pas un résultat Nysa exporté.", en: "This file is not an exported Nysa result." },
  "res.import.err_big":   { fr: "Ce fichier est trop volumineux (80 Mo maximum).", en: "This file is too large (80 MB maximum)." },
  "res.import.fail":      { fr: "L'import a échoué : {msg}", en: "Import failed: {msg}" },
  "res.report.btn":       { fr: "Signaler un problème", en: "Report a problem" },
  "res.report.title":     { fr: "Signaler un problème avec ce résultat", en: "Report a problem with this result" },
  "res.report.intro":     { fr: "Décrivez ce que vous attendiez et ce que vous observez. Une copie de ce résultat sera transmise à Nysa, et vous pourrez la retirer à tout moment.",
                            en: "Describe what you expected and what you see. A copy of this result will be sent to Nysa, and you can withdraw it at any time." },
  "res.report.msg_label": { fr: "Que s'est-il passé ?", en: "What happened?" },
  "res.report.msg_ph":    { fr: "Par exemple : la MTF me paraît trop haute pour cette ouverture, ou l'image est noire.", en: "For example: the MTF looks too high for this aperture, or the image is black." },
  "res.report.consent":   { fr: "J'autorise Nysa à consulter les données de ce résultat (paramètres de l'instrument, conditions de simulation, images et journaux de calcul), uniquement pour analyser le problème décrit ci-dessus. Ces données sont copiées à part et supprimées une fois le problème traité. Nysa pourra me répondre à l'adresse de mon compte, et je peux demander la suppression de ces données à tout moment à contact@nysa-imaging.com.",
                            en: "I authorize Nysa to access the data of this result (instrument parameters, simulation conditions, images and computation logs), only to analyze the problem described above. This data is copied separately and deleted once the problem is handled. Nysa may reply to my account address, and I can ask for this data to be deleted at any time at contact@nysa-imaging.com." },
  "res.report.send":      { fr: "Envoyer le signalement", en: "Send report" },
  "res.report.cancel":    { fr: "Annuler", en: "Cancel" },
  "res.report.sending":   { fr: "Envoi en cours…", en: "Sending…" },
  "res.report.err_short": { fr: "Décrivez le problème en quelques mots (10 caractères au minimum).", en: "Describe the problem in a few words (at least 10 characters)." },
  "res.report.err_send":  { fr: "L'envoi a échoué : {msg}", en: "Sending failed: {msg}" },
  "res.report.done_title":{ fr: "Merci, c'est envoyé", en: "Thank you, it was sent" },
  "res.report.done_text": { fr: "Nysa a reçu une copie de ce résultat et pourra vous répondre à l'adresse de votre compte. Vous pouvez retirer ce signalement à tout moment.",
                            en: "Nysa received a copy of this result and can reply to your account address. You can withdraw this report at any time." },
  "res.report.withdraw":  { fr: "Retirer ce signalement", en: "Withdraw this report" },
  "res.report.withdrawn": { fr: "Signalement retiré : la copie a été supprimée.", en: "Report withdrawn: the copy has been deleted." },
  "res.report.close":     { fr: "Fermer", en: "Close" },
  "res.tab.logs":        { fr: "Logs", en: "Logs" },
  "res.logs.title":      { fr: "Journaux du calcul", en: "Computation logs" },
  "res.logs.copy":       { fr: "Copier les journaux", en: "Copy logs" },
  "res.logs.copied":     { fr: "Copié", en: "Copied" },
  "res.logs.empty":      { fr: "Aucun journal enregistré pour ce résultat.", en: "No log saved for this result." },
  "res.logs.inputs":     { fr: "Entrées admin de ce calcul", en: "Admin inputs of this run" },
  "sim.help.ti.title":   { fr: "Temps d'intégration", en: "Integration time" },
  "sim.help.ti.text":    { fr: "Minimum {min} µs (FMC = 1).\nCe minimum dépend de l'iFoV de l'instrument et de l'altitude : avec un iFoV de {ifov} µrad à {alt} km, l'image met {min} µs à parcourir un pixel.\nMaximum {max} µs.",
                           en: "Minimum {min} µs (FMC = 1).\nThis minimum depends on the instrument iFoV and the altitude: with an iFoV of {ifov} µrad at {alt} km, the image takes {min} µs to travel one pixel.\nMaximum {max} µs." },
  "sim.help.ti.text_nofmc": { fr: "Minimum {min} µs.\nMaximum {max} µs.", en: "Minimum {min} µs.\nMaximum {max} µs." },
  "sim.val.between":     { fr: "Entre {min} et {max}{unit}.", en: "Between {min} and {max}{unit}." },
  "sim.val.int_between": { fr: "Nombre entier entre {min} et {max}.", en: "Whole number between {min} and {max}." },
  "sim.tdi.hint":        { fr: "1 = sans TDI", en: "1 = no TDI" },

  // FMC et bulles d'aide de la page Simulations
  "sim.fmc.label":       { fr: "FMC (facteur de compensation)", en: "FMC (compensation factor)" },
  "sim.fmc.swept":       { fr: "Distance balayée pendant l'intégration : {px} px, ramenée à 1 px par la FMC.", en: "Distance scanned during integration: {px} px, brought back to 1 px by the FMC." },
  "sim.fmc.detail":      { fr: "Vitesse au sol {vg} km/s · Pas au sol {gsd} m", en: "Ground speed {vg} km/s · GSD {gsd} m" },
  "sim.fmc.unavailable": { fr: "Choisissez un instrument et des conditions valides pour afficher la FMC.", en: "Choose an instrument and valid conditions to display the FMC." },
  "sim.help.tdi.title":  { fr: "TDI, intégration à retard temporel", en: "TDI, time delay integration" },
  "sim.help.tdi.text":   { fr: "Le détecteur lit la même ligne de la scène plusieurs fois, au fil du défilement de l'image, et additionne ces lectures : le signal augmente. Ce champ est le nombre d'étages lus et additionnés.\n1 = pas de TDI (un seul étage).",
                           en: "The detector reads the same line of the scene several times as the image moves across it, and sums these readouts: the signal increases. This field is the number of stages read and summed.\n1 = no TDI (a single stage)." },
  "sim.help.fmc.title":  { fr: "FMC, compensation du défilement", en: "FMC, forward motion compensation" },
  "sim.help.fmc.text":   { fr: "Pendant le temps d'intégration, le satellite avance et la scène défile sur le détecteur de plusieurs pixels. Pour ramener ce défilement à 1 pixel, un facteur de FMC (Forward Motion Compensation) est appliqué : c'est la valeur affichée.\nFMC = 1 : aucune compensation nécessaire.\nCalcul pour une orbite circulaire, visée au nadir. Valeur indicative : le simulateur ne modélise pas encore le filé.",
                           en: "During the integration time, the satellite moves forward and the scene scrolls across the detector by several pixels. To bring this motion back to 1 pixel, a FMC factor (Forward Motion Compensation) is applied: this is the value displayed.\nFMC = 1: no compensation needed.\nComputed for a circular orbit, nadir viewing. Indicative value: the simulator does not model smear yet." },

  // ---------------- page de connexion (login.html) ----------------
  "login.doc_title":     { fr: "Connexion | Nysa", en: "Sign in | Nysa" },
  "login.h1":            { fr: "Accès au simulateur complet", en: "Access the full simulator" },
  "login.sub":           { fr: "Connectez-vous ou créez un compte pour accéder à vos instruments et résultats.",
                           en: "Sign in or create an account to access your instruments and results." },
  "login.tab.login":     { fr: "Se connecter", en: "Sign in" },
  "login.tab.signup":    { fr: "Créer un compte", en: "Create account" },
  "login.email":         { fr: "E-mail", en: "Email" },
  "login.password":      { fr: "Mot de passe", en: "Password" },
  "login.password2":     { fr: "Confirmer le mot de passe", en: "Confirm password" },
  "login.btn.login":     { fr: "Se connecter", en: "Sign in" },
  "login.btn.signup":    { fr: "Créer mon compte", en: "Create my account" },
  "login.msg.other_device": { fr: "Vous avez été déconnecté car ce compte a été utilisé sur un autre appareil. Une seule connexion à la fois est autorisée.",
                              en: "You were signed out because this account was used on another device. Only one session at a time is allowed." },
  "login.msg.deleted":   { fr: "Votre compte et vos données ont été supprimés.",
                           en: "Your account and your data have been deleted." },
  "login.msg.mismatch":  { fr: "Les deux mots de passe ne sont pas identiques.",
                           en: "The two passwords do not match." },
  "login.msg.created":   { fr: "Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse avant de vous connecter.",
                           en: "Account created. Check your inbox to confirm your address before signing in." }
};

// ============================================================================
// Textes repérés par leur version française.
//
// Pour les pages très denses (création d'instrument), le texte français sert
// lui-même de repère : à gauche le français tel qu'il est écrit dans la page,
// à droite sa traduction. Dans une page : tx("texte français") ou l'attribut
// data-tx sur un élément. Les {mots} entre accolades sont remplacés par une
// valeur et doivent être repris tels quels dans la traduction.
// Pour corriger une traduction : modifier la partie droite uniquement.
// ============================================================================
var I18N_TEXT = {
  // ---- création d'instrument : cadre de la page ----
  "Créer un instrument | Nysa": "Create an instrument | Nysa",
  "← Mes objets": "← My instruments",
  "Configuration de l'instrument": "Instrument configuration",
  "Configuration": "Configuration",
  "Nom de l'instrument": "Instrument name",
  "Mon instrument": "My instrument",
  "Type": "Type",
  "Charger une configuration": "Load a configuration",
  "Exporter la configuration": "Export configuration",
  "Aide": "Help",
  "Suivant : {label}": "Next: {label}",
  "Réinitialiser ce bloc": "Reset this block",
  "Enregistrer l'instrument": "Save instrument",
  "Paramètres avancés": "Advanced settings",
  "Vue de face": "Front view",
  "Vue de côté": "Side view",
  "Courbe de transfert": "Transfer curve",

  // ---- blocs ----
  "Instrument": "Instrument",
  "Optique": "Optics",
  "Détecteur": "Detector",
  "Électronique": "Electronics",
  "Performance WFE": "WFE performance",

  // ---- libellés des champs ----
  "iFoV": "iFoV",
  "Diamètre de pupille": "Pupil diameter",
  "Obscuration centrale": "Central obscuration",
  "Nombre de supports": "Number of spider vanes",
  "Épaisseur des supports": "Spider vane thickness",
  "Transmission optique": "Optical transmission",
  "Type de détecteur": "Detector type",
  "Largeur pixel": "Pixel pitch",
  "Rendement quantique": "Quantum efficiency",
  "PRNU": "PRNU",
  "Courant d'obscurité": "Dark current",
  "DSNU (EMVA 1288)": "DSNU (EMVA 1288)",
  "Temps de référence DSNU": "DSNU reference time",
  "Résolution ADC": "ADC resolution",
  "Full well": "Full well",
  "Bruit de lecture": "Read noise",
  "Mode de saisie de l'électronique": "Electronics input mode",
  "Choisir…": "Choose…",
  "Détaillé (facteur de conversion + plage ADC)": "Detailed (conversion factor + ADC range)",
  "Datasheet (gain global en DN/e⁻)": "Datasheet (overall gain in DN/e⁻)",
  "Pleine échelle ADC = full well": "ADC full scale = full well",
  "Facteur de conversion": "Conversion factor",
  "Gain de l'amplificateur (PGA)": "Amplifier gain (PGA)",
  "Plage d'entrée de l'ADC": "ADC input range",
  "Gain global": "Overall gain",
  "Niveau noir": "Black level",
  "Accumulateur TDI": "TDI accumulator",
  "WFE RMS": "WFE RMS",

  // ---- textes indicatifs et unités ----
  "obligatoire": "required",
  "0 (défaut)": "0 (default)",
  "1 (défaut)": "1 (default)",
  "sans perte (défaut)": "lossless (default)",
  "0 à 1": "0 to 1",

  // ---- bulles d'aide ----
  "Angle sous lequel un pixel voit la scène : pas pixel divisé par la focale. Exemple : 5 µm / 2.5 m = 2 µrad.":
    "Angle under which one pixel sees the scene: pixel pitch divided by focal length. Example: 5 µm / 2.5 m = 2 µrad.",
  "Diamètre utile du miroir primaire dans le cas d'un télescope de type Cassegrain, Ritchey-Chrétien ou Korsch. Il fixe la limite de diffraction et le flux collecté, proportionnel à son carré.":
    "Clear diameter of the primary mirror for a Cassegrain, Ritchey-Chrétien or Korsch telescope. It sets the diffraction limit and the collected flux, which scales with its square.",
  "Diamètre de l'ombre du miroir secondaire, baffle compris, en mètres et non en ratio. Laisser vide pour un télescope sans obstruction.":
    "Diameter of the shadow cast by the secondary mirror, baffle included, in meters and not as a ratio. Leave empty for an unobstructed telescope.",
  "Nombre de bras qui tiennent le miroir secondaire.":
    "Number of vanes holding the secondary mirror.",
  "Largeur d'un bras vue de face. Obligatoire dès qu'un nombre de supports est saisi.":
    "Width of one vane seen from the front. Required as soon as a number of vanes is entered.",
  "Produit des réflectivités et transmissions de tous les éléments optiques. Exemple : quatre miroirs à 0,95 donnent 0,81. Ne pas y inclure le filtre de bande ni le rendement du détecteur.":
    "Product of the reflectivities and transmissions of all optical elements. Example: four mirrors at 0.95 give 0.81. Do not include the band filter or the detector efficiency.",
  "Pas entre deux pixels voisins, ligne « pixel pitch » ou « pixel size » des datasheets.":
    "Distance between two neighboring pixels, the “pixel pitch” or “pixel size” line in datasheets.",
  "Probabilité qu'un photon arrivant sur le pixel donne un électron. Saisir 0,65 pour 65 %.":
    "Probability that a photon reaching the pixel produces an electron. Enter 0.65 for 65%.",
  "Dispersion de la réponse d'un pixel à l'autre, en % RMS. Une valeur crête à crête est plusieurs fois plus grande et ne doit pas être saisie telle quelle.":
    "Pixel-to-pixel response variation, in % RMS. A peak-to-peak value is several times larger and must not be entered as is.",
  "Électrons générés sans lumière, par pixel et par seconde, à la température de fonctionnement. Depuis des nA/cm² : multiplier par la surface du pixel et diviser par la charge de l'électron.":
    "Electrons generated without light, per pixel and per second, at operating temperature. From nA/cm²: multiply by the pixel area and divide by the electron charge.",
  "Dispersion du signal d'obscurité d'un pixel à l'autre, en électrons RMS, mesurée selon l'EMVA 1288. Laisser 0 si la datasheet ne la donne pas.":
    "Pixel-to-pixel variation of the dark signal, in electrons RMS, measured per EMVA 1288. Leave 0 if the datasheet does not give it.",
  "Temps d'exposition utilisé pour mesurer la DSNU. Obligatoire dès que la DSNU est non nulle : sans lui, la valeur ne peut pas être ramenée au temps d'intégration.":
    "Exposure time used to measure the DSNU. Required as soon as the DSNU is non-zero: without it, the value cannot be scaled to the integration time.",
  "Nombre de bits du convertisseur, donc 2^bits codes (4 096 pour 12 bits). Profondeur d'une lecture, avant sommation des étages TDI.":
    "Number of bits of the converter, hence 2^bits codes (4,096 for 12 bits). Depth of a single readout, before the TDI stages are summed.",
  "Charge maximale d'un pixel, ligne « full well capacity » ou « saturation capacity ». Capacité d'un étage, pas la capacité cumulée après TDI.":
    "Maximum charge of a pixel, the “full well capacity” or “saturation capacity” line. Capacity of one stage, not the cumulative capacity after TDI.",
  "Bruit ajouté à chaque lecture, en électrons RMS. Avec un TDI numérique il s'ajoute à chaque étage.":
    "Noise added at each readout, in electrons RMS. With digital TDI it is added at each stage.",
  "À choisir selon ce que donne la datasheet. Sans aucune donnée électronique, « Pleine échelle ADC = full well » suppose l'ADC réglé pour que sa pleine échelle corresponde au puits plein : seuls le full well et le nombre de bits comptent.":
    "Choose according to what the datasheet provides. With no electronics data at all, “ADC full scale = full well” assumes the ADC is set so that its full scale matches the full well: only the full well and the number of bits matter.",
  "Tension produite par électron, ligne « conversion gain » des datasheets. Ne pas saisir l'inverse (e⁻/V).":
    "Voltage produced per electron, the “conversion gain” line in datasheets. Do not enter the inverse (e⁻/V).",
  "Gain en tension appliqué avant l'ADC. Laisser 1 en l'absence d'amplificateur programmable.":
    "Voltage gain applied before the ADC. Leave 1 if there is no programmable amplifier.",
  "Tension convertie par l'ADC, de 0 à cette valeur. Vérification : full well × facteur de conversion × gain doit être proche de cette plage ; au-delà, l'ADC sature avant le puits.":
    "Voltage converted by the ADC, from 0 to this value. Check: full well × conversion factor × gain should be close to this range; beyond it, the ADC saturates before the well.",
  "Nombre de DN par électron. Si la datasheet donne des e⁻/DN, saisir l'inverse.":
    "Number of DN per electron. If the datasheet gives e⁻/DN, enter the inverse.",
  "Offset électronique ajouté à chaque étage, distinct du courant d'obscurité. Doit rester inférieur à 2^bits − 1.":
    "Electronic offset added at each stage, distinct from dark current. Must remain below 2^bits − 1.",
  "Profondeur du registre qui somme les étages. Vide : dimensionné pour ne jamais saturer. Sinon au moins égal à la résolution ADC.":
    "Depth of the register that sums the stages. Empty: sized so that it never saturates. Otherwise at least equal to the ADC resolution.",
  "Écart RMS entre le front d'onde réel et le front d'onde parfait, en nanomètres. Repère : λ/14, soit environ 39 nm à 550 nm, pour une optique limitée par la diffraction.":
    "RMS deviation between the actual wavefront and the perfect one, in nanometers. Rule of thumb: λ/14, about 39 nm at 550 nm, for diffraction-limited optics.",

  // ---- contrôles de saisie ----
  "Obligatoire dès qu'un nombre de supports est saisi.": "Required as soon as a number of vanes is entered.",
  "Nombre attendu.": "A number is expected.",
  "Fraction attendue, entre {min} et {max} (0.62 pour 62 %).": "A fraction is expected, between {min} and {max} (0.62 for 62%).",
  "Valeur strictement positive attendue.": "A strictly positive value is expected.",
  "L'obscuration doit rester inférieure au diamètre de pupille.": "The obscuration must remain smaller than the pupil diameter.",
  "32 bits au plus.": "32 bits at most.",
  "Doit rester inférieur à 2^bits − 1.": "Must remain below 2^bits − 1.",
  "Au moins égal à la résolution ADC.": "At least equal to the ADC resolution.",
  "Valeur inhabituelle : obscuration supérieure à la moitié du diamètre.": "Unusual value: obscuration larger than half the diameter.",
  "Valeur inhabituelle : en général entre {lo} et {hi}{u}.": "Unusual value: usually between {lo} and {hi}{u}.",
  "Valeur inhabituelle : en général jusqu'à {hi}{u}.": "Unusual value: usually up to {hi}{u}.",
  "Disponible avec une obscuration centrale.": "Available with a central obscuration.",
  "À {km} km d'altitude : pas au sol de {gsd} m.": "At {km} km altitude: GSD of {gsd} m.",
  "Focale équivalente": "Equivalent focal length",
  "ouverture": "aperture",

  // ---- courbes spectrales ----
  "Valeur constante": "Constant value",
  "Courbe": "Curve",
  "Courbe à saisir dans la section sous le schéma.": "Enter the curve in the section below the diagram.",
  "Courbe spectrale du rendement": "Quantum efficiency spectral curve",
  "Courbe spectrale de la transmission": "Transmission spectral curve",
  "Points de la courbe": "Curve points",
  "+ Ajouter un point": "+ Add a point",
  "Supprimer ce point": "Delete this point",
  "Aucun point défini.": "No point defined.",
  "Un point par longueur d'onde, transmission en fraction (0-1, pas en %). La courbe doit couvrir les bandes : en dehors, la valeur du point le plus proche est gardée.":
    "One point per wavelength, transmission as a fraction (0-1, not in %). The curve must cover the bands: outside it, the value of the nearest point is kept.",
  "Un point par longueur d'onde, QE en fraction (0-1, pas en %).": "One point per wavelength, QE as a fraction (0-1, not in %).",
  "Au moins 2 points valides pour afficher la courbe.": "At least 2 valid points to display the curve.",
  "Longueur d'onde déjà saisie : la ligne en double est ignorée.": "Wavelength already entered: the duplicate row is ignored.",
  "Valeur hors de 0 à 1 : ce point est ignoré.": "Value outside 0 to 1: this point is ignored.",
  "Longueur d'onde inhabituelle : en général entre {a} et {b} nm (vérifier l'unité).": "Unusual wavelength: usually between {a} and {b} nm (check the unit).",
  "courbe spectrale ({label}) : valeur hors de 0 à 1": "spectral curve ({label}): value outside 0 to 1",
  "courbe spectrale ({label}) : longueur d'onde en double": "spectral curve ({label}): duplicate wavelength",

  // ---- cas WFE et détail Zernike ----
  "Cas WFE (thermique, etc.)": "WFE cases (thermal, etc.)",
  "+ Cas RMS": "+ RMS case",
  "+ Cas fichier": "+ File case",
  "Aucun cas WFE défini.": "No WFE case defined.",
  "Supprimer ce cas": "Delete this case",
  "{n} lignes · {file}": "{n} rows · {file}",
  "Convention Zernike": "Zernike convention",
  "Centre champ": "Field center",
  "Bord gauche": "Left edge",
  "Bord droit": "Right edge",
  "Détail Zernike": "Zernike detail",
  "Front d'onde combiné (fausses couleurs) d'une colonne donnée, pour un cas WFE fichier chargé ci-dessus.":
    "Combined wavefront (false color) for a given column, for a file-based WFE case loaded above.",
  "Chargez un cas WFE « fichier » ci-dessus pour voir le détail (un cas RMS n'a pas de coefficients détaillés).":
    "Load a file-based WFE case above to see the detail (an RMS case has no detailed coefficients).",
  "Bande {b} · ": "Band {b} · ",
  "Colonne {c}": "Column {c}",
  "CSV illisible ou vide.": "Unreadable or empty CSV.",
  "P-V : ": "P-V: ",
  "RMS : ": "RMS: ",
  "Nom du cas WFE (ex. « Cas chaud », « Cas froid en orbite ») :": "WFE case name (e.g. “Hot case”, “Cold case in orbit”):",
  "WFE RMS pour ce cas (nm) :": "WFE RMS for this case (nm):",
  "Valeur invalide : un nombre est attendu (chiffres, signe moins autorisé).": "Invalid value: a number is expected (digits, minus sign allowed).",
  "Fichier illisible : CSV attendu au format « Detector_ID;Band;Column;Z1;...;Z37 » (séparateur point-virgule).":
    "Unreadable file: CSV expected in the format “Detector_ID;Band;Column;Z1;...;Z37” (semicolon separator).",
  "piston": "piston",
  "tilt (X)": "tilt (X)",
  "tilt (Y)": "tilt (Y)",
  "défocalisation": "defocus",
  "astigmatisme": "astigmatism",
  "astigmatisme oblique": "oblique astigmatism",
  "astigmatisme secondaire": "secondary astigmatism",
  "coma (X)": "coma (X)",
  "coma (Y)": "coma (Y)",
  "coma secondaire": "secondary coma",
  "trefoil": "trefoil",
  "trefoil oblique": "oblique trefoil",
  "tétrafoil": "tetrafoil",
  "tétrafoil oblique": "oblique tetrafoil",
  "sphérique": "spherical",

  // ---- schéma de l'électronique ----
  "gain global CWF": "overall gain CWF",
  "pleine échelle = full well": "full scale = full well",
  "mode à choisir": "mode to choose",
  "pleine échelle ADC": "ADC full scale",
  "Pour tracer la courbe, renseigner": "To plot the curve, fill in",
  "la résolution ADC": "the ADC resolution",
  "le full well": "the full well",
  "le mode": "the mode",
  "les champs du mode": "the mode fields",
  "bruit de lecture = {x} DN": "read noise = {x} DN",
  "Pleine échelle ADC au full well.": "ADC full scale at full well.",
  "L'ADC sature à {e} e⁻, {p} % du full well.": "The ADC saturates at {e} e⁻, {p}% of the full well.",
  "Full well atteint à {dn} DN, {p} % des codes.": "Full well reached at {dn} DN, {p}% of the codes.",
  "Lumière incidente": "Incident light",

  // ---- enregistrement et chargement ----
  "Donnez un nom à l'instrument avant de l'enregistrer.": "Give the instrument a name before saving it.",
  "À corriger avant d'enregistrer : {list}.": "To fix before saving: {list}.",
  "Enregistrement…": "Saving…",
  "Échec de l'enregistrement : {msg}": "Saving failed: {msg}",
  "Limite de 20 instruments atteinte. Supprimez-en un pour en créer un nouveau.": "Limit of 20 instruments reached. Delete one to create a new one.",
  "Enregistré comme brouillon. Il manque : {list}.": "Saved as a draft. Missing: {list}.",
  "Enregistré.": "Saved.",
  "Charger ce fichier remplace toute la saisie en cours. Continuer ?": "Loading this file replaces everything currently entered. Continue?",
  "Fichier illisible : JSON attendu.": "Unreadable file: JSON expected.",

  // ---- démo publique (index.html) ----
  "Simulateur de qualité image | Nysa": "Image quality simulator | Nysa",
  "Mentions légales et conditions d'essai": "Legal notice and beta terms",
  "Politique de confidentialité": "Privacy policy",
  "Optique, détecteur, acquisition : visualisez leur impact sur l'image avant de construire votre système.":
    "Optics, detector, acquisition: see their impact on the image before you build your system.",
  "Source": "Source",
  "Atmosphère": "Atmosphere",
  "Radiométrie": "Radiometry",
  "Simulateur complet →": "Full simulator →",
  "Choisissez une image source": "Choose a source image",
  "Configurez votre instrument": "Configure your instrument",
  "Vue": "View",
  "Image simulée": "Simulated image",
  "Image source": "Source image",
  "Graphes": "Plots",
  "Résolution au sol": "Ground resolution",
  "MTF à Nyquist": "MTF at Nyquist",
  "Facteur Q": "Q factor",
  "Rapport entre la coupure optique et la fréquence de Nyquist du détecteur. Q < 1 : le pixel limite. Q > 2 : l'optique limite.":
    "Ratio between the optical cutoff and the detector Nyquist frequency. Q < 1: the pixel is the limit. Q > 2: the optics are the limit.",
  "Déplacer vers le haut": "Move up",
  "Déplacer vers la gauche": "Move left",
  "Déplacer vers la droite": "Move right",
  "Déplacer vers le bas": "Move down",
  "Position du curseur de comparaison": "Comparison slider position",
  "Glissez sur l'image pour comparer": "Drag across the image to compare",
  "Ajusté": "Fit",
  "Fonction de transfert de modulation": "Modulation transfer function",
  "Pupille et front d'onde": "Pupil and wavefront",
  "avance de phase": "phase lead",
  "retard": "phase lag",
  "intensité relative": "relative intensity",
  "Vous travaillez sur votre propre instrument ?": "Working on your own instrument?",
  "Passez de la démonstration à la simulation complète de votre instrument.": "Move from the demo to the full simulation of your instrument.",
  "Accéder au simulateur complet →": "Access the full simulator →",
  "Chaîne de détection": "Detection chain",
  "Acquisition": "Acquisition",
  "Orbite et éclairement": "Orbit and illumination",
  "Plus de paramètres dans le simulateur complet →": "More parameters in the full simulator →",
  "Aperçu affiché": "Preview shown",
  "Lancer la simulation": "Run simulation",
  "Qu'est-ce que ça change ?": "What does it change?",
  "L'aperçu instantané est une approximation rapide. \"Lancer la simulation\" déclenche le calcul physique complet (optique, atmosphère et détecteur) sur les mêmes scènes.":
    "The instant preview is a fast approximation. “Run simulation” triggers the full physical computation (optics, atmosphere and detector) on the same scenes.",
  "Scènes : IGN, BD ORTHO® 2023, Licence Ouverte Etalab 2.0.": "Scenes: IGN, BD ORTHO® 2023, Etalab Open Licence 2.0.",
  "Hypothèses et sources": "Assumptions and sources",
  "Pitch pixel": "Pixel pitch",
  "Temps d'intégration": "Integration time",
  "Étages TDI": "TDI stages",
  "Altitude": "Altitude",
  "Élévation solaire": "Sun elevation",
  "Pupille annulaire, obscuration centrale ε = {e}. Front d'onde plat : la PSF est une tache d'Airy.":
    "Annular pupil, central obscuration ε = {e}. Flat wavefront: the PSF is an Airy pattern.",
  "Budget d'erreur de front d'onde de <b>{w} nm RMS</b>, soit ±{p} onde en crête, modélisé par un étalement équivalent de la PSF. C'est cette carte de phase qui la déforme ci-contre.":
    "Wavefront error budget of <b>{w} nm RMS</b>, i.e. ±{p} wave peak, modeled as an equivalent spreading of the PSF. This phase map is what distorts it, as shown here.",
  "Échelle logarithmique sur 4 décades. La tache d'Airy mesure <b>{a} m</b> au sol, pour un pixel de <b>{g} m</b>.":
    "Logarithmic scale over 4 decades. The Airy disk measures <b>{a} m</b> on the ground, for a pixel of <b>{g} m</b>.",
  "<span class='flag'>La tache déborde largement du pixel</span> : c'est l'optique qui limite la résolution.":
    "<span class='flag'>The spot extends well beyond the pixel</span>: the optics limit the resolution.",
  "Tache et pixel sont du même ordre : l'échantillonnage suit l'optique.": "Spot and pixel are of the same order: the sampling matches the optics.",
  "Focale ≈ <b>{f}</b> · F/# ≈ <b>{n}</b>, dérivés du pitch et de l'iFoV.": "Focal length ≈ <b>{f}</b> · F/# ≈ <b>{n}</b>, derived from the pitch and the iFoV.",
  "<span class='flag'>Q = {q}, inférieur à 1.</span> L'optique transmet encore du contraste au-delà de Nyquist : ce contenu trop fin pour le pixel se replie dans l'image sous forme d'artefacts. C'est un choix de conception assumé, pas un défaut. Il privilégie le rapport signal/bruit et la largeur de fauchée.":
    "<span class='flag'>Q = {q}, below 1.</span> The optics still transmit contrast beyond Nyquist: this content, too fine for the pixel, folds back into the image as artifacts. This is a deliberate design choice, not a flaw. It favors signal-to-noise ratio and swath width.",
  "Q = {q}, supérieur à 2. Le pixel n'est plus le facteur limitant : affiner le détecteur n'apporterait rien tant que la pupille ne grandit pas.":
    "Q = {q}, above 2. The pixel is no longer the limiting factor: a finer detector would bring nothing as long as the pupil does not grow.",
  "Q = {q}. L'échantillonnage est accordé à la coupure optique : optique et détecteur pèsent du même ordre dans le budget de contraste.":
    "Q = {q}. The sampling is matched to the optical cutoff: optics and detector weigh about the same in the contrast budget.",
  "fréquence spatiale au sol (cycles/m)": "ground spatial frequency (cycles/m)",
  "contraste transmis": "transmitted contrast",
  "optique (pupille + WFE)": "optics (pupil + WFE)",
  "détecteur": "detector",
  "chaîne complète": "full chain",
  "Aperçu, lancer simulation": "Preview, run simulation",
  "Simulation en cours": "Simulation running",
  "Simulation terminée.": "Simulation complete.",
  "Quota atteint. Réessayez dans quelques minutes.": "Quota reached. Please try again in a few minutes.",
  "Le serveur a refusé la requête ({status}).": "The server rejected the request ({status}).",
  "Image de résultat illisible.": "Unreadable result image.",
  "Nouvelle tentative ({a}/{m})…": "Retrying ({a}/{m})…",
  "Serveur injoignable. L'aperçu navigateur reste disponible.": "Server unreachable. The browser preview remains available."
};

// Noms de champs enregistrés en français avec un brouillon d'instrument
// (liste « il manque… ») : libellé français → clé du dictionnaire.
var I18N_FIELD_FR = {
  "iFoV": "field.I", "Diamètre de pupille": "field.D", "Obscuration centrale": "field.E",
  "Transmission optique": "field.T", "WFE RMS": "field.W", "Largeur pixel": "field.PX",
  "Nombre de supports": "field.NSUP", "Épaisseur des supports": "field.ESUP",
  "Bruit de lecture": "field.R", "PRNU": "field.P", "Courant d'obscurité": "field.K",
  "Full well": "field.FW", "Rendement quantique": "field.QE", "Résolution ADC": "field.ADC"
};

// Messages d'erreur du serveur de simulation (main.py), écrits en français :
// DÉBUT du message → clé. On compare le début seulement, pour que le texte reste
// reconnu si le serveur change une ponctuation ou un mot de fin (c'est ce qui
// s'était produit : « … cette adresse — réessaie plus tard. » ne correspondait
// pas à la phrase attendue). Un message absent de cette table est affiché tel quel.
var I18N_API_FR = {
  "Authentification requise": "api.auth",
  "Impossible de vérifier l'abonnement": "api.sub_check",
  "Aucun abonnement actif sur ce compte": "api.sub_none",
  "Abonnement inactif": "api.sub_inactive",
  "Abonnement ou période d'essai expiré": "api.sub_expired",
  "Trop de simulations depuis cette adresse": "api.rate_ip",
  "Trop de simulations depuis ce compte": "api.rate_account",
  "Trop de requêtes depuis ce compte": "api.rate_requests",
  "Accès réservé à l'administrateur": "api.admin_only",
  "Électronique non renseignée : ouvrez l'instrument": "api.electronics"
};

// ============================================================================
// Moteur — rien à modifier en dessous pour ajouter ou corriger un texte.
// ============================================================================
(function(){
  function stored(){ try { return localStorage.getItem(I18N_STORAGE_KEY); } catch(e){ return null; } }
  function store(v){ try { localStorage.setItem(I18N_STORAGE_KEY, v); } catch(e){ /* navigation privée stricte */ } }

  // ?lang=en ou ?lang=fr dans l'adresse : choix mémorisé, puis retiré de l'adresse.
  var fromUrl = null;
  try {
    var params = new URLSearchParams(window.location.search);
    var q = (params.get("lang") || "").toLowerCase();
    if(I18N_LANGS.indexOf(q) >= 0){
      fromUrl = q; store(q);
      params.delete("lang");
      var rest = params.toString();
      window.history.replaceState(null, "", window.location.pathname + (rest ? "?" + rest : "") + window.location.hash);
    }
  } catch(e){ /* adresse non lisible : on garde la langue mémorisée */ }

  var saved = stored();
  var lang = fromUrl || (I18N_LANGS.indexOf(saved) >= 0 ? saved : I18N_DEFAULT);
  // Tant que le basculement n'a pas eu lieu, seul un choix explicite par
  // ?lang= active l'anglais : un visiteur ordinaire reste en français.
  var explicit = !!fromUrl || (I18N_LANGS.indexOf(saved) >= 0);
  // Langue choisie par l'adresse (?lang=) : pour un utilisateur connecté, elle
  // devient sa préférence au lieu d'être remplacée par celle-ci (cf. requireAuth).
  window.__nysaLangFromUrl = !!fromUrl;

  window.nysaLang = function(){ return lang; };
  window.nysaLocale = function(){ return lang === "fr" ? "fr-FR" : "en-GB"; };

  var missing = {};
  window.t = function(key, vars){
    var entry = I18N[key];
    var s = entry ? (entry[lang] != null ? entry[lang] : entry.fr) : null;
    if(s == null){
      if(!missing[key]){ missing[key] = true; console.warn("Texte manquant dans i18n.js :", key); }
      return key;
    }
    if(vars){
      s = s.replace(/\{(\w+)\}/g, function(m, name){ return vars[name] != null ? vars[name] : m; });
    }
    return s;
  };

  // Nom de scène : la base enregistre le nom français (« Ville », « Port »…).
  window.tScene = function(name){
    return (name != null && I18N["scene." + name]) ? t("scene." + name) : name;
  };
  // Nom de bande : le serveur les nomme en français (« Rouge », « Vert », « Bleu »).
  window.tBand = function(name){
    return (name != null && I18N["band." + name]) ? t("band." + name) : name;
  };
  // Nom d'un champ manquant d'un brouillon : enregistré en français avec
  // l'instrument. La table I18N_FIELD_FR (libellé français → clé) sera
  // remplie avec la traduction de la page de création d'instrument.
  window.tField = function(frLabel){
    if(lang === "fr" || !frLabel) return frLabel;
    var key = I18N_FIELD_FR[frLabel];
    if(key) return t(key);
    // « courbe spectrale (rendement quantique) » : le libellé entre parenthèses est en minuscules.
    var m = /^courbe spectrale \((.+)\)$/.exec(frLabel);
    if(m){
      var inner = m[1];
      for(var fr in I18N_TEXT){ if(fr.toLowerCase() === inner){ inner = I18N_TEXT[fr].toLowerCase(); break; } }
      return "spectral curve (" + inner + ")";
    }
    return txq(frLabel);
  };

  // Texte repéré par sa version française (table I18N_TEXT).
  var missingTx = {};
  function fillVars(s, vars){
    return vars ? s.replace(/\{(\w+)\}/g, function(m, name){ return vars[name] != null ? vars[name] : m; }) : s;
  }
  window.tx = function(fr, vars){
    var s = fr;
    if(lang !== "fr" && fr){
      var en = I18N_TEXT[fr];
      if(en != null) s = en;
      else if(!missingTx[fr]){ missingTx[fr] = true; console.warn("Texte manquant dans i18n.js (I18N_TEXT) :", fr); }
    }
    return fillVars(s, vars);
  };
  // Même chose, sans avertissement : unités et valeurs souvent identiques dans les deux langues.
  window.txq = function(fr){
    return (lang !== "fr" && fr && I18N_TEXT[fr] != null) ? I18N_TEXT[fr] : fr;
  };
  // Même chose, pour un attribut HTML écrit entre apostrophes.
  window.txa = function(fr, vars){
    return tx(fr, vars).replace(/&/g, "&amp;").replace(/'/g, "&#39;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  };

  // Message d'erreur du serveur : traduit s'il est connu, sinon affiché tel quel.
  window.tApi = function(msg){
    if(typeof msg !== "string") return msg;
    for(var prefix in I18N_API_FR){
      if(msg.indexOf(prefix) === 0) return t(I18N_API_FR[prefix]);
    }
    if(msg.indexOf("Jeton invalide ou expiré") === 0 || msg.indexOf("Impossible de vérifier le jeton") === 0) return t("api.token");
    return msg;
  };

  // Applique les textes aux éléments marqués. Sans effet sur le reste de la page.
  window.applyI18n = function(root){
    root = root || document;
    var each = function(sel, fn){ Array.prototype.forEach.call(root.querySelectorAll(sel), fn); };
    each("[data-i18n]",       function(el){ el.textContent = t(el.getAttribute("data-i18n")); });
    each("[data-i18n-ph]",    function(el){ el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph"))); });
    each("[data-i18n-title]", function(el){ el.setAttribute("title", t(el.getAttribute("data-i18n-title"))); });
    each("[data-i18n-aria]",  function(el){ el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria"))); });
    each("[data-i18n-alt]",   function(el){ el.setAttribute("alt", t(el.getAttribute("data-i18n-alt"))); });
    // data-tx : le texte français de l'élément sert de repère (table I18N_TEXT).
    each("[data-tx]",         function(el){ el.textContent = tx(el.textContent.replace(/\s+/g, " ").trim()); });
    each("[data-tx-ph]",      function(el){ el.setAttribute("placeholder", tx(el.getAttribute("placeholder"))); });
    each("[data-tx-aria]",    function(el){ el.setAttribute("aria-label", tx(el.getAttribute("aria-label"))); });
    each("[data-tx-title]",   function(el){ el.setAttribute("title", tx(el.getAttribute("title"))); });
    // data-i18n-html : texte contenant une mise en forme (uniquement des textes de ce fichier).
    each("[data-i18n-html]",  function(el){ el.innerHTML = t(el.getAttribute("data-i18n-html")); });
  };

  // Mémorise une langue sans recharger la page (inscription, connexion).
  window.nysaStoreLang = function(code){
    if(I18N_LANGS.indexOf(code) >= 0) store(code);
  };

  // Change de langue : mémorise le choix, l'enregistre comme préférence du
  // compte si un utilisateur est connecté, puis recharge la page pour que
  // tous les textes construits en JavaScript repartent dans la bonne langue.
  window.setNysaLang = async function(next, onState){
    if(I18N_LANGS.indexOf(next) < 0 || next === lang) return;
    var say = function(s){ if(onState) onState(s); };
    say("saving");
    var ok = true;
    try {
      if(typeof supabaseClient !== "undefined" && supabaseClient.auth && supabaseClient.auth.updateUser){
        var res = await supabaseClient.auth.getSession();
        if(res && res.data && res.data.session){
          // On attend la vraie confirmation, 8 secondes au plus.
          var up = await Promise.race([
            supabaseClient.auth.updateUser({ data: { lang: next } }),
            new Promise(function(r){ setTimeout(function(){ r({ error: "timeout" }); }, 8000); })
          ]);
          ok = !(up && up.error);
        }
      }
    } catch(e){ ok = false; console.warn("Préférence de langue non enregistrée :", e); }
    // Avec une fonction de retour (paramètres) : en cas d'échec, on reste dans la langue actuelle.
    // Sans (sélecteur EN / FR du haut) : on mémorise la langue et on recharge quand même.
    if(!ok && onState){ say("error"); return; }
    store(next);
    say("saved");
    setTimeout(function(){ window.location.reload(); }, onState ? 600 : 0);
  };

  // Petits drapeaux (dessinés ici, rien n'est chargé d'un service extérieur ; les drapeaux en émoji
  // ne s'affichent pas sous Windows). Anglais : drapeau britannique.
  var FLAGS = {
    fr: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 2'><rect width='1' height='2' fill='#0055A4'/><rect x='1' width='1' height='2' fill='#fff'/><rect x='2' width='1' height='2' fill='#EF4135'/></svg>",
    en: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 40'><rect width='60' height='40' fill='#012169'/><path d='M0 0L60 40M60 0L0 40' stroke='#fff' stroke-width='8'/><path d='M0 0L60 40M60 0L0 40' stroke='#C8102E' stroke-width='3'/><path d='M30 0V40M0 20H60' stroke='#fff' stroke-width='13'/><path d='M30 0V40M0 20H60' stroke='#C8102E' stroke-width='8'/></svg>"
  };
  window.nysaFlagSrc = function(code){ return "data:image/svg+xml," + encodeURIComponent(FLAGS[code] || FLAGS.en); };

  // Sélecteur EN / FR : inséré dans tout élément portant data-lang-switch.
  function mountSwitch(){
    if(!I18N_SWITCH && !explicit) return;
    Array.prototype.forEach.call(document.querySelectorAll("[data-lang-switch]"), function(host){
      host.textContent = "";
      host.classList.add("langswitch");
      host.setAttribute("role", "group");
      host.setAttribute("aria-label", t("lang.switch.label"));
      I18N_LANGS.forEach(function(code){
        var b = document.createElement("button");
        b.type = "button";
        var flag = document.createElement("img");
        flag.src = window.nysaFlagSrc(code); flag.alt = ""; flag.width = 16; flag.height = 11;
        b.appendChild(flag);
        b.appendChild(document.createTextNode(code.toUpperCase()));
        b.setAttribute("aria-pressed", code === lang ? "true" : "false");
        b.addEventListener("click", function(){ setNysaLang(code); });
        host.appendChild(b);
      });
    });
  }

  var css = document.createElement("style");
  css.textContent =
    // La page reste invisible le temps d'appliquer la langue : pas d'éclair de texte dans l'autre langue.
    "html.i18n-pending body{visibility:hidden}"+
    "[data-lang-switch]:empty{display:none}"+   // sélecteur masqué : il ne prend aucune place
    ".langswitch{display:inline-flex;gap:2px;font-family:var(--mono,monospace);font-size:12px;letter-spacing:.04em}"+
    ".langswitch button{background:transparent;border:1px solid transparent;border-radius:4px;padding:3px 7px;"+
      "color:var(--muted-2,#8497AA);cursor:pointer;font:inherit;display:inline-flex;align-items:center;gap:6px}"+
    ".langswitch img{border-radius:2px;display:block}"+
    ".langswitch button:hover{color:var(--paper,#C4D6D4)}"+
    ".langswitch button[aria-pressed='true']{color:var(--paper,#C4D6D4);border-color:var(--line,#2E4152)}";
  document.head.appendChild(css);

  document.documentElement.lang = lang;
  var html = document.documentElement;
  html.classList.add("i18n-pending");
  var done = false;
  function ready(){
    if(done) return; done = true;
    try { applyI18n(document); mountSwitch(); }
    finally { html.classList.remove("i18n-pending"); }
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();
  setTimeout(ready, 1500);   // filet de sécurité : la page ne reste jamais masquée
})();
