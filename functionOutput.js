exports.handler = __f0;

function __f1() {
  return (function() {
    with({  }) {

      return function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
      };

    }
  }).apply(undefined, undefined).apply(this, arguments);
}

function __f0() {
  return (function() {
    with({ __awaiter: __f1 }) {

      return () => __awaiter(this, void 0, void 0, function* () {
        // I would prefer being able to import outside of the lambda scope but this is not currently possible
        const { createResponse } = yield Promise.resolve().then(() => require('./bin/utils'));
        const { getAllBofEvents } = yield Promise.resolve().then(() => require('./bin/dynamo'));
        try {
          const events = yield getAllBofEvents();
          return createResponse(200, events);
        }
        catch (e) {
          console.log(e);
          return createResponse(400, e.message);
        }
      });

    }
  }).apply(undefined, undefined).apply(this, arguments);
}
