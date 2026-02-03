NEWSCHEMA('USSDApp', function (schema) {

	// Liste tous les opérateurs
	schema.action('list', {
		name: 'List Instances',
		query: 'search:String, status:String',
		action: async function ($) {
			try {
				var builder = DATA.find('nosql/tbl_ussdapps');

				// Auto-query avec les champs disponibles
				builder.autoquery(
					$.query,
					'name:String,port:Number,ussdCode:String,status:String,url:String,containerId:String,createdAt:Date,updatedAt:Date',
					'dtcreated_desc',
					50
				);

				// Recherche par nom
				if ($.query.search) {
					builder.search('name', $.query.search);
				}

				// Filtrer par statut
				if ($.query.status) {
					builder.where('status', $.query.status);
				}

				let instances = await builder.promise();

				// Optionnel : synchroniser le statut réel avec Docker
				for (let instance of instances) {
					const statusResult = await USSDDockerOps.getStatus(instance.name);
					if (statusResult.success) {
						instance.realTimeStatus = statusResult.status;
					}
				}

				$.callback(instances);
			} catch (err) {
				$.invalid(err);
			}
		}
	});

	// Lire un opérateur spécifique
	schema.action('read', {
		name: 'Read Instance',
		params: '*name:String',
		action: async function ($) {
			try {
				let instance = await DATA.find('nosql/tbl_ussdapps')
					.where('name', $.params.name)
					.first()
					.promise();

				if (!instance) {
					return $.invalid('Opérateur introuvable');
				}

				// Récupérer le statut en temps réel
				const statusResult = await USSDDockerOps.getStatus($.params.name);
				if (statusResult.success) {
					instance.realTimeStatus = statusResult.status;
				}

				$.callback(instance);
			} catch (err) {
				$.invalid(err);
			}
		}
	});

	// Déployer un nouvel opérateur
	schema.action('deploy', {
		name: 'Deploy Instance',
		input: '*name:String, *port:Number, ussdCode:String',
		action: async function ($, model) {
			try {
				const result = await USSDDockerOps.deploy({
					name: model.name,
					port: model.port,
					ussdCode: model.ussdCode || '*000#'
				});

				if (result.success) {
					$.success(result.message);
					$.callback(result.operator);
				} else {
					$.invalid(result.error);
				}
			} catch (err) {
				$.invalid(err);
			}
		}
	});

	// Démarrer un opérateur
	schema.action('start', {
		name: 'Start Instance',
		params: '*name:String',
		action: async function ($) {
			try {
				const result = await USSDDockerOps.start($.params.name);

				if (result.success) {
					$.success(result.message);
				} else {
					$.invalid(result.error);
				}
			} catch (err) {
				$.invalid(err);
			}
		}
	});

	// Arrêter un opérateur
	schema.action('stop', {
		name: 'Stop Instance',
		params: '*name:String',
		action: async function ($) {
			try {
				const result = await USSDDockerOps.stop($.params.name);

				if (result.success) {
					$.success(result.message);
				} else {
					$.invalid(result.error);
				}
			} catch (err) {
				$.invalid(err);
			}
		}
	});

	// Basculer l'état (start/stop)
	schema.action('toggle', {
		name: 'Toggle Instance',
		params: '*name:String',
		action: async function ($) {
			try {
				const result = await USSDDockerOps.toggle($.params.name);

				if (result.success) {
					$.success(result.message);
				} else {
					$.invalid(result.error);
				}
			} catch (err) {
				$.invalid(err);
			}
		}
	});

	// Supprimer un opérateur
	schema.action('delete', {
		name: 'Delete Instance',
		params: '*name:String',
		action: async function ($) {
			try {
				const result = await USSDDockerOps.delete($.params.name);

				if (result.success) {
					$.success(result.message);
				} else {
					$.invalid(result.error);
				}
			} catch (err) {
				$.invalid(err);
			}
		}
	});

	// Obtenir le statut en temps réel
	schema.action('status', {
		name: 'Get Instance Status',
		params: '*name:String',
		action: async function ($) {
			try {
				const result = await USSDDockerOps.getStatus($.params.name);

				if (result.success) {
					$.callback(result);
				} else {
					$.invalid(result.error);
				}
			} catch (err) {
				$.invalid(err);
			}
		}
	});

	// Obtenir les logs
	schema.action('logs', {
		name: 'Get Instance Logs',
		params: '*name:String, lines:Number',
		action: async function ($) {
			try {
				const lines = $.params.lines || 100;
				const result = await USSDDockerOps.getLogs($.params.name, lines);

				if (result.success) {
					$.callback(result.logs);
				} else {
					$.invalid(result.error);
				}
			} catch (err) {
				$.invalid(err);
			}
		}
	});

	// Obtenir les statistiques
	schema.action('stats', {
		name: 'Get Instance Stats',
		params: '*name:String',
		action: async function ($) {
			try {
				const result = await USSDDockerOps.getStats($.params.name);

				if (result.success) {
					$.callback(result.stats);
				} else {
					$.invalid(result.error);
				}
			} catch (err) {
				$.invalid(err);
			}
		}
	});

	// Surveiller tous les opérateurs
	schema.action('monitor', {
		name: 'Monitor All Instances',
		action: async function ($) {
			try {
				const result = await USSDDockerOps.monitorAll();

				if (result.success) {
					$.success(`${result.monitored} opérateurs surveillés`);
				} else {
					$.invalid(result.error);
				}
			} catch (err) {
				$.invalid(err);
			}
		}
	});

	// Lister tous les conteneurs Docker (debug)
	schema.action('containers', {
		name: 'List All Docker Containers',
		action: async function ($) {
			try {
				const result = await USSDDockerOps.listContainers();

				if (result.success) {
					$.callback(result.containers);
				} else {
					$.invalid(result.error);
				}
			} catch (err) {
				$.invalid(err);
			}
		}
	});
});

console.log('✅ Schema Instances chargé avec USSDDockerOps');