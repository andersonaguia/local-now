import { ClassConstructor, plainToInstance } from 'class-transformer';

export function toDto<T>(cls: ClassConstructor<T>, data: object): T {
  return plainToInstance(cls, data, {
    excludeExtraneousValues: true,
    exposeUnsetFields: false,
  });
}
