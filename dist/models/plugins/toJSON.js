/* eslint-disable no-param-reassign */
const deleteAtPath = (obj, path, index) => {
    if (index === path.length - 1) {
        delete obj[path[index]];
        return;
    }
    deleteAtPath(obj[path[index]], path, index + 1);
};
const toJSON = (schema) => {
    schema.set('toJSON', {
        transform: function (doc, ret) {
            Object.keys(schema.paths).forEach((path) => {
                if (schema.paths[path].options && schema.paths[path].options.private) {
                    deleteAtPath(ret, path.split('.'), 0);
                }
            });
            if (ret._id) {
                ret.id = ret._id.toString();
            }
            delete ret._id;
            delete ret.__v;
        },
    });
};
export default toJSON;
// Previous implementation (not working)
// const toJSON = <T extends SchemaDocument>(schema: Schema<T>) => {
//   let transform: Function | undefined;
//   if (schema.options.toJSON && schema.options.toJSON.transform) {
//     transform = schema.options.toJSON.transform;
//   }
//   schema.options.toJSON = Object.assign(schema.options.toJSON || {}, {
//     transform(doc: T, ret: any, options: any) {
//       Object.keys(schema.paths).forEach((path) => {
//         if (schema.paths[path].options && schema.paths[path].options.private) {
//           deleteAtPath(ret, path.split('.'), 0);
//         }
//       });
//       if (ret._id) {
//         ret.id = ret._id.toString();
//       }
//       delete ret._id;
//       delete ret.__v;
//       if (transform) {
//         return transform(doc, ret, options);
//       }
//     },
//   });
// };
