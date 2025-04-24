Patterns

1. All services must have type definitions in services.d.ts which the controller
   uses instead of directly using service as type.
2. DO NOT forward any external service errors, instead return a ServiceError
   class, set the error message to devMessage prop, error instance to rootError
   prop and send custom error message using message prop.
3. Any errors that are safe to forward should be a ControllerError, exe.
   validation related errors.
4. DO NOT directly import external files from within services and controllers
   module. Use externals.ts
5. Keep controller and service instances alive all the time in
   /routes/instances.ts. Do not instantiate more than one instance for each
   unless really necessary.
6. Reserve utils.ts file for functions that you don't quite know where to place
   yet. Remember to only define it in the relevant module. Exe. we don't need a
   generateResponse function in anywhere except /routes module.
