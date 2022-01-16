import helmet from 'helmet';

export default [
  helmet.dnsPrefetchControl(),
  helmet.expectCt(),
  helmet.frameguard({action: 'deny'}),
  helmet.hidePoweredBy(),
  helmet.hsts(),
  helmet.ieNoOpen(),
  helmet.noSniff(),
  helmet.permittedCrossDomainPolicies({permittedPolicies: 'none'}),
  helmet.xssFilter(),
];
