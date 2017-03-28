import getLdapConfig from './get_ldap_config';

export default function (server, request, remoteUser, kibanaIndexSuffix) {

  const ldapConfig = getLdapConfig(server, remoteUser);
  let groups = [];

  ldapConfig.client.search(ldapConfig.rolebase, ldapConfig.options, function (error, response) {
    if (error != undefined) {
      server.log(['plugin:own-home', 'error'], 'LDAP search error: ' + error);
      return false;
    }

    response.on('searchEntry', function(entry) {
      server.log(['plugin:own-home', 'debug'], 'LDAP search result: ' + entry.object[ldapConfig.rolenameAttribute]);
      if (entry.object[ldapConfig.rolenameAttribute] !== remoteUser) {
        groups.push(entry.object[ldapConfig.rolenameAttribute]);
      }
    });

    response.on('error', function(error) {
      server.log(['plugin:own-home', 'error'], 'LDAP search error: ' + error.message);
      return false;
    });

    response.on('end', function(result) {
      server.log(['plugin:own-home', 'debug'], 'LDAP search status: ' + result.status);
      server.log(['plugin:own-home', 'debug'], 'Found LDAP groups: ' + groups.toString());
      for (let i = 0; i < groups.length; i++) {
        if (groups[i] == kibanaIndexSuffix) {
          return true;
        }
      }
      return false;
    });
  });
};