import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
    let service: AuthService;
    let mockUserModel: any;
    let mockJwtService: any;
    let mockConfigService: any;

    beforeEach(async () => {
        mockUserModel = {
            findOne: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
        };

        mockJwtService = {
            signAsync: jest.fn().mockResolvedValue('mocked-token'),
            verify: jest.fn(),
        };

        mockConfigService = {
            get: jest.fn().mockImplementation((key) => {
                if (key === 'jwt.secret') return 'test-secret';
                if (key === 'jwt.refreshSecret') return 'test-refresh-secret';
                return 'mock-value';
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: getModelToken(User.name),
                    useValue: mockUserModel,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should throw ConflictException if email exists', async () => {
            mockUserModel.findOne.mockResolvedValue({ _id: '123', email: 'test@example.com' });

            await expect(service.register({ email: 'test@example.com', password: 'password' }))
                .rejects.toThrow(ConflictException);
        });

        it('should successfully register a user and return tokens', async () => {
            mockUserModel.findOne.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
            mockUserModel.create.mockResolvedValue({ _id: '123', email: 'test@example.com' });
            mockUserModel.findByIdAndUpdate.mockResolvedValue(true);

            const result = await service.register({ email: 'test@example.com', password: 'password' });

            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(mockUserModel.create).toHaveBeenCalled();
        });
    });

    describe('login', () => {
        it('should throw UnauthorizedException on wrong password', async () => {
            mockUserModel.findOne.mockResolvedValue({ _id: '123', email: 'test@example.com', passwordHash: 'hash' });
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.login({ email: 'test@example.com', password: 'wrong' }))
                .rejects.toThrow(UnauthorizedException);
        });

        it('should successfully login and return tokens', async () => {
            mockUserModel.findOne.mockResolvedValue({ _id: '123', email: 'test@example.com', passwordHash: 'hash' });
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (bcrypt.hash as jest.Mock).mockResolvedValue('new-refresh-hash');
            mockUserModel.findByIdAndUpdate.mockResolvedValue(true);

            const result = await service.login({ email: 'test@example.com', password: 'password' });

            expect(result).toHaveProperty('accessToken');
            expect(result.accessToken).toBe('mocked-token');
        });
    });

    describe('logout', () => {
        it('should nullify the refreshTokenHash if user exists', async () => {
            mockUserModel.findById.mockResolvedValue({ _id: '123' });
            mockUserModel.findByIdAndUpdate.mockResolvedValue(true);

            await service.logout('123');

            expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('123', { refreshTokenHash: null });
        });

        it('should throw NotFoundException if user missing', async () => {
            mockUserModel.findById.mockResolvedValue(null);

            await expect(service.logout('123')).rejects.toThrow(NotFoundException);
        });
    });
});
