import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from './user.model';

@Table({ tableName: 'tokens', timestamps: false })
export class Token extends Model<Token> {
  @ForeignKey(() => User)
  @Column({ type: DataType.STRING, allowNull: false })
  userId: string;

  @Column({ unique: true, type: DataType.STRING, allowNull: false })
  accessToken: string;

  @Column({ unique: true, type: DataType.STRING, allowNull: false })
  refreshToken: string;
}
