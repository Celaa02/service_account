export class Account {
  constructor(
    public id: string,
    public holderName: string,
    public accountNumber: string,
    public balance: number,
    public createdAt: Date,
    public ownerId: string,
  ) {}
}
