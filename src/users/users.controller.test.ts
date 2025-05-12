import { UserController } from "./users.controller";
import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { CreateUserDTO } from "./dto/create-user.dto";
import { UpdateUserDTO } from "./dto/update-user.dto";
import { UserDocument } from "./schemas/user.schema";

describe("UserController", () => {
  let userController: UserController;
  let userService: UsersService;

  const mockUserService = {
    createUser: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{
        provide: UsersService,
        useValue: mockUserService,
    }],
    }).compile();

    userController = moduleRef.get<UserController>(UserController);
    userService = moduleRef.get<UsersService>(UsersService);
  });

  describe("findAll", () => {
    it("should return an array of users", async () => {
      const result: {results: number, data: Partial<UserDocument>[]} = {
        results: 2,
        data: [
          { id: "1", name: "John Doe" } as Partial<UserDocument>,
          { id: "2", name: "Jane Doe" } as Partial<UserDocument>,
        ],
      };
      jest.spyOn(userService, "findAll").mockResolvedValue(result as any);

      expect(await userController.getAll({})).toEqual({
        status: "success",
        message: "2 user(s) found",
        data: result.data,
      });

      expect(userService.findAll).toHaveBeenCalledWith({});
      expect(userService.findAll).toHaveBeenCalledTimes(1);
      
    });
  });


  describe("getOne", () => {
    it("should return a user", async () => {
      const result: Partial<UserDocument> = { id: "1", name: "John Doe" } as Partial<UserDocument>;
      jest.spyOn(userService, "findOne").mockResolvedValue(result as any);

      expect(await userController.getOne("1")).toEqual({
        status: "success",
        data: { user: result },
      });

      expect(userService.findOne).toHaveBeenCalledWith({ _id: "1" });
      expect(userService.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateOne", () => {
    it("should update a user", async () => {
      const result: Partial<UserDocument> = { id: "1", name: "Jane Doe" } as Partial<UserDocument>;
      const updateUserDTO: UpdateUserDTO = { name: "Jane Doe" };
      jest.spyOn(userService, "update").mockResolvedValue(result as any);

      const response = await userController.updateOne("1", updateUserDTO);
      expect(response).toEqual({
        status: "success",
        message: "User updated successfully!",
        data: { user: result },
      });
      expect(response.data.user.name).toEqual("Jane Doe");
      expect(userService.update).toHaveBeenCalledWith("1", updateUserDTO);
      expect(userService.update).toHaveBeenCalledTimes(1);
    });
  });


  describe("deleteOne", () => {
    it("should delete a user", async () => {
      jest.spyOn(userService, "delete").mockResolvedValue(undefined);

      await userController.deleteOne("1");

      expect(userService.delete).toHaveBeenCalledWith("1");
      expect(userService.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("createUser", () => {
    it("should create a new user", async () => {
      const result: Partial<UserDocument> = { id: "1", name: "John Doe" } as Partial<UserDocument>;
      const createUserDTO: CreateUserDTO = { name: "John Doe", email: "john.doe@example.com", password: "password" }; 
      jest.spyOn(userService, "createUser").mockResolvedValue(result as any);

      expect(await userController.createUser(createUserDTO)).toEqual({
        status: "success",
        message: 'New user created successfully!',
        data: { user: result },
      });

      expect(userService.createUser).toHaveBeenCalledWith(createUserDTO);
      expect(userService.createUser).toHaveBeenCalledTimes(1);
    });
  });
});