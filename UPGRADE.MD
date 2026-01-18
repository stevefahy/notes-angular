
Make sure that you are using a supported version of node.js before you upgrade your application. Angular v17 supports node.js versions: v18.13.0 and newer

Basic

Make sure that you are using a supported version of TypeScript before you upgrade your application. Angular v17 supports TypeScript version 5.2 or later.

Basic

Make sure that you are using a supported version of Zone.js before you upgrade your application. Angular v17 supports Zone.js version 0.14.x or later.

Basic

In the application's project directory, run ng update @angular/core@17 @angular/cli@17 to update your application to Angular v17.

Basic

Run ng update @angular/material@17.

Basic

Make sure you configure setupTestingRouter, canceledNavigationResolution, paramsInheritanceStrategy, titleStrategy, urlUpdateStrategy, urlHandlingStrategy, and malformedUriErrorHandler in provideRouter or RouterModule.forRoot since these properties are now not part of the Router's public API

Basic

You may need to adjust the equality check for NgSwitch because now it defaults to stricter check with === instead of ==. Angular will log a warning message for the usages where you'd need to provide an adjustment.

Basic

If you want the child routes of loadComponent routes to inherit data from their parent specify the paramsInheritanceStrategy to always, which in v17 is now set to emptyOnly.

Basic

Make sure that you are using a supported version of node.js before you upgrade your application. Angular v18 supports node.js versions: v18.19.0 and newer

Basic

In the application's project directory, run ng update @angular/core@18 @angular/cli@18 to update your application to Angular v18.

Basic

Run ng update @angular/material@18.

Basic

Update TypeScript to versions 5.4 or newer.

Basic

In the application's project directory, run ng update @angular/core@19 @angular/cli@19 to update your application to Angular v19.

Basic

Run ng update @angular/material@19.

Basic