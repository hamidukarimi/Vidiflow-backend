# Vidiflow Backend - Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-07-03

### Added
- User authentication (register, login, logout)
- JWT access tokens + refresh tokens with rotation
- OAuth foundation (Google/Facebook ready)
- Download management system
- Provider architecture for extensibility
- YouTube and TikTok provider examples
- Async background job processing with BullMQ
- Download history and favorites
- Rate limiting on auth endpoints
- Centralized error handling
- Input validation with express-validator
- Comprehensive Prisma database schema

### Technical
- TypeScript strict mode
- Feature-based modular architecture
- Clean separation of concerns (controllers → services → repositories)
- Prisma ORM with PostgreSQL

### Known Issues
- Video extraction is mocked (returns placeholder data)
- File storage not implemented