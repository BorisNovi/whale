import { Column, Model, Table, DataType } from 'sequelize-typescript';

@Table({ tableName: 'users', timestamps: false })
export class User extends Model<User> {
  @Column({ primaryKey: true, type: DataType.STRING, allowNull: false })
  userId: string;

  @Column({ unique: true, type: DataType.STRING, allowNull: false })
  username: string;

  @Column({ type: DataType.STRING, allowNull: false })
  color: string;

  @Column({ type: DataType.DATE, allowNull: true })
  lastSeen: Date;
}
