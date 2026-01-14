import { Model, Document } from "mongoose";
import { IBaseRepository } from "../../application/Interfaces/IBaseRepository";

export abstract class BaseRepository<TEntity, TModel extends Document> implements IBaseRepository<TEntity> {
  
  constructor(
    protected readonly _model: Model<TModel>
  ) {}

  protected abstract toEntity(model: TModel): TEntity;

  async create(item: any): Promise<TEntity> {
    // Note: 'item' type is loose because Domain Entity usually differs from Mongoose creation DTO.
    // In strict env, we would have a separate 'CreateDTO'.
    const createdItem = await this._model.create(item);
    return this.toEntity(createdItem);
  }

  async findById(id: string): Promise<TEntity | null> {
    const found = await this._model.findById(id);
    return found ? this.toEntity(found) : null;
  }

  async findAll(): Promise<TEntity[]> {
    const foundList = await this._model.find();
    return foundList.map((item) => this.toEntity(item));
  }

  async update(id: string, item: Partial<TEntity>): Promise<TEntity | null> {
    const updated = await this._model.findByIdAndUpdate(id, item as any, { new: true });
    return updated ? this.toEntity(updated as any) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this._model.findByIdAndDelete(id);
    return !!result;
  }
}
