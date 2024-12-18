import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcrypt";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import multer from "multer";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { authenticateJWT } from "@/middleware/middleware";
import createLicense from "@/models/license/createLicense";
import deleteLicense from "@/models/license/deleteLicense";
import { DefaultRole, isAdmin } from "@/models/staff/isAdmin";
import alteruserIp from "@/models/license/alteruserIp";
import { getUserInfos } from "@/models/user/getUserInfos";
import { createCategory } from "@/models/shop/category/createCategory";
import { deleteCategory } from "@/models/shop/category/deleteCategory";
import { createProduct } from "@/models/shop/product/createProduct";
import { deleteProduct } from "@/models/shop/product/deleteProduct";
import { getAllProducts } from "@/models/shop/product/getAllProducts";
import { updateProduct } from "@/models/shop/product/updateProduct";
dotenv.config();

const storage = multer.memoryStorage();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Limite de 5 tentativas
  message: "Muitas tentativas de login. Tente novamente mais tarde.",
});

export default () => {
  const prisma = new PrismaClient();
  const router = Router();

  router.get(
    "/settings/store",
    // authenticateJWT,
    async (req: any, res: any): Promise<void> => {
      res.status(200).json({
        name: process.env.StoreName || "Não Definido",
        image: process.env.StoreImage || "",
      });
    }
  );
  // http://localhost:4041/register
  // {
  // "name": "Vini Santos",
  // "email": "danilovinicius1790@gmail.com",
  // "password": "aaa"
  // }
  router.post(
    "/register",
    authenticateJWT,
    async (req: any, res: any): Promise<void> => {
      const { name, email, password } = req.body;

      const userEmail = req.user.email;
      try {
        const adminStatus = await isAdmin(userEmail);

        if (!adminStatus) {
          res.status(401).json({ error: "Not Is Admin." });
          return;
        }

        if (!name) {
          res.status(400).json({ message: "Nome de úsuario não definido." });
          return;
        }
        if (!email) {
          res.status(400).json({ message: "Email não definido." });
          return;
        }
        if (!password) {
          res.status(400).json({ message: "Senha não definida." });
          return;
        }
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          res.status(400).json({ message: "Usuário já existe." });
          return;
        }

        const hashedPassword = await bcrypt.hash(password, 20);

        const user = await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            avatar: req.file ? req.file.buffer.toString("base64") : null,
          },
        });

        res.status(201).json({ message: "Usuário criado com sucesso!", user });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao criar usuário." });
      }
    }
  );
  // http://localhost:4041/login
  // {
  //  "email": "danilovinicius1790@gmail.com",
  //  "password": "aaa"
  // }
  //
  // router.post(
  //   "/login",
  //   // loginLimiter,
  //   async (req: any, res: any): Promise<void> => {
  //     const authHeader = req.headers.authorization;
  //     const { email, password } = req.body;
  //     console.log(email, password);

  //     if (authHeader) {
  //       const token = authHeader.split(" ")[1];

  //       try {
  //         const decoded = jwt.verify(
  //           token,
  //           process.env.JWT_SECRET || "your_jwt_secret"
  //         );
  //         return res.status(200).json({
  //           message: "Usuário já está logado.",
  //         });
  //       } catch (error: any) {
  //         if (error.name === "TokenExpiredError") {
  //           if (!email || !password) {
  //             return res.status(401).json({
  //               message:
  //                 "Token expirado. Informe email e senha para fazer login novamente.",
  //             });
  //           }

  //           const user = await prisma.user.findUnique({
  //             where: { email },
  //           });

  //           if (!user) {
  //             return res
  //               .status(400)
  //               .json({ message: "Usuário não encontrado." });
  //           }

  //           const isPasswordValid = await bcrypt.compare(
  //             password,
  //             user.password
  //           );
  //           if (!isPasswordValid) {
  //             return res.status(400).json({ message: "Senha inválida." });
  //           }

  //           const newToken = jwt.sign(
  //             { id: user.id, email: user.email },
  //             process.env.JWT_SECRET || "your_jwt_secret",
  //             {
  //               algorithm: "HS256",
  //               expiresIn: "30m",
  //             }
  //           );

  //           return res.json({
  //             message: "Login renovado com sucesso!",
  //             token: newToken,
  //           });
  //         } else if (error.name === "JsonWebTokenError") {
  //           return res.status(401).json({ message: "Token inválido." });
  //         } else {
  //           return res.status(500).json({
  //             message: "Erro ao verificar token.",
  //             error: error.message,
  //           });
  //         }
  //       }
  //     }

  //     if (!email) {
  //       res.status(400).json({ message: "Email não definido." });
  //       return;
  //     }

  //     if (!password) {
  //       res.status(400).json({ message: "Senha não definida." });
  //       return;
  //     }

  //     const user = await prisma.user.findUnique({
  //       where: { email },
  //     });

  //     if (!user) {
  //       res.status(400).json({ message: "Usuário não encontrado." });
  //       return;
  //     }

  //     const isPasswordValid = await bcrypt.compare(password, user.password);
  //     if (!isPasswordValid) {
  //       res.status(400).json({ message: "Senha inválida." });
  //       return;
  //     }

  //     const token = jwt.sign(
  //       { id: user.id, email: user.email },
  //       process.env.JWT_SECRET || "your_jwt_secret",
  //       {
  //         algorithm: "HS256",
  //         expiresIn: "30m",
  //       }
  //     );

  //     res.json({ message: "Login bem-sucedido!", token });
  //   }
  // );
  router.post("/login", async (req: any, res: any): Promise<void> => {
    const authHeader = req.headers.authorization;
    const { email, password, lembret } = req.body;

    if (authHeader) {
      const token = authHeader.split(" ")[1];

      if (!token) {
        return res.status(400).json({ message: "Token não fornecido." });
      }

      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "your_jwt_secret"
        );
        return res.status(200).json({
          message: "Usuário já está logado.",
        });
      } catch (error: any) {
        if (error.name === "TokenExpiredError") {
          if (!email || !password) {
            return res.status(401).json({
              message:
                "Token expirado. Informe email e senha para fazer login novamente.",
            });
          }

          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            return res.status(400).json({ message: "Usuário não encontrado." });
          }

          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            return res.status(400).json({ message: "Senha inválida." });
          }

          const newToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || "your_jwt_secret",
            { algorithm: "HS256", expiresIn: "30m" }
          );
          res.cookie("authToken", newToken, {
            httpOnly: true,
            maxAge: 30 * 60 * 1000, // 30 minutos
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
          });
          return res.json({
            message: "Login renovado com sucesso!",
            token: newToken,
          });
        } else if (error.name === "JsonWebTokenError") {
          // return res.status(401).json({ message: "Token inválido." });
        } else {
          return res.status(500).json({
            message: "Erro ao verificar token.",
            error: error.message,
          });
        }
      }
    }

    if (!email || !password) {
      return res.status(400).json({ message: "Email ou senha não definidos." });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "Usuário não encontrado." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Senha inválida." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "your_jwt_secret",
      { algorithm: "HS256", expiresIn: "30m" }
    );

    const UserAdmin = await prisma.admin.findUnique({
      where: {
        email: user.email,
      },
    });
    res.cookie("authToken", token, {
      httpOnly: true,
      maxAge: 30 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({
      message: "Login bem-sucedido!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: UserAdmin.role,
      },
    });
  });
  router.post("/sigUp", async (req: Request, res: Response): Promise<void> => {
    const {
      email,
      password,
      name,
    }: { email: string; password: string; name: string } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ message: "Todos os campos são obrigatórios." });
      return;
    }
    const existingAccountAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser || existingAccountAdmin) {
      res.status(400).json({ message: "Este email já está registrado." });
      return;
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    try {
      const newUserAccount = await prisma.admin.create({
        data: {
          email: email,
          role: DefaultRole,
        },
      });

      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
      });

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email },
        process.env.JWT_SECRET || "your_jwt_secret",
        {
          algorithm: "HS256",
          expiresIn: "30m",
        }
      );

      res.cookie("authToken", token, {
        httpOnly: true, // Impede que o token seja acessado via JavaScript no cliente
        maxAge: 30 * 60 * 1000, // Expiração de 30 minutos
        secure: process.env.NODE_ENV === "production", // Só envia o cookie em HTTPS em produção
        sameSite: "strict", // Previne o envio de cookies em requisições cross-site
      });

      res.status(201).json({
        message: "Usuário criado com sucesso!",
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUserAccount.role,
        },
      });
      return;
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erro ao criar o usuário.", error: error.message });
    }
  });

  router.post("/checkAuth", async (req: any, res: any) => {
    const { token } = req.body;
    if (!token) {
      return res.status(401).json({ message: "Token não fornecido." });
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_jwt_secret"
      ) as JwtPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        return res.status(401).json({ message: "Usuário não encontrado." });
      }

      const UserAdmin = await prisma.admin.findUnique({
        where: {
          email: user.email,
        },
      });

      return res.status(200).json({
        message: "Token válido!",
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: UserAdmin.role,
        },
      });
    } catch (error) {
      return res.status(401).json({
        message: "Token inválido ou expirado.",
        error: error.message,
        success: false,
      });
    }
  });
  router.post("/logout", async (req: any, res: any) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Token não fornecido." });
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_jwt_secret"
      ) as JwtPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        return res.status(401).json({ message: "Usuário não encontrado." });
      }

      return res.status(200).json({
        message: "Deslogado com sucesso!",
        success: true,
        user: null,
      });
    } catch (error) {
      return res.status(401).json({
        message: "Token inválido ou expirado.",
        error: error.message,
        success: false,
      });
    }
  });

  // http://localhost:4041/createLicense
  router.post("/createLicense", authenticateJWT, async (req: any, res: any) => {
    const { email, resource, ip, days } = req.body;
    const userEmail = req.user.email;

    try {
      const adminStatus = await isAdmin(userEmail);

      if (!adminStatus) {
        res.status(401).json({ error: "Not Is Admin." });
        return;
      }
      if (!email) {
        res.status(400).json({ message: "Email não definido." });
        return;
      }

      const user = await prisma.user.findUnique({ where: { email } });
      const userId = user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado." });
      }

      if (!resource) {
        res.status(400).json({ message: "Resource não definido." });
        return;
      }

      if (!ip) {
        res.status(400).json({ message: "IP não definida." });
        return;
      }

      if (!userId) {
        new Error("id Não Definido.");
        return false;
      }

      const newLicense = createLicense(prisma, userId, resource, ip, days);
      if (newLicense) {
        res.json({ message: "Licensa gerada com sucesso!", newLicense });
        return newLicense;
      }
    } catch (error) {
      return res.status(401).json({ error: error });
    }
  });
  // http://localhost:4041/getUserResources
  router.get(
    "/getUserResources",
    authenticateJWT,
    async (req: any, res: any): Promise<any> => {
      try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        const userId = user?.id;
        const UserResources = await prisma.licenses.findMany({
          where: { userId },
        });
        res.status(200).json(UserResources);
      } catch (error) {
        res.status(500);
      }
    }
  );

  // http://localhost:4041/insertAdmin
  router.post(
    "/insertAdmin",
    authenticateJWT,
    async (req: any, res: any): Promise<void> => {
      const { newRole, email } = req.body;
      const userEmail = req.user.email;
      try {
        const adminStatus = await isAdmin(userEmail);

        if (!adminStatus) {
          res.status(401).json({ error: "Not Is Admin." });
          return;
        }
        if (!newRole || !email) {
          res.status(400).json({ error: "Role and email are required." });
          return;
        }
        const validRoles = [
          "Ceo",
          "Coo",
          "Gerente",
          "Vendedor",
          "Parceiro",
          "Cliente",
          "Membro",
        ];

        if (!validRoles.includes(newRole)) {
          res.status(400).json({ error: "Cargo não cadastrado." });
          return;
        }

        const existingEmail = await prisma.user.findUnique({
          where: { email },
        });

        if (!existingEmail) {
          res.status(400).json({ error: "Email não cadastrado." });
          return;
        }

        const role = newRole;
        const existingAdmin = await prisma.admin.findUnique({
          where: { email },
        });

        if (existingAdmin) {
          const updatedAdmin = await prisma.admin.update({
            where: { email },
            data: { role },
          });
          res.status(200).json(updatedAdmin);
        } else {
          const newAdmin = await prisma.admin.create({
            data: {
              role,
              email,
            },
          });
          res.status(201).json(newAdmin);
        }
      } catch (error) {
        console.error("Erro ao inserir ou atualizar administrador:", error);
        res.status(500).json({ error: "Internal server error." });
      }
    }
  );

  // http://localhost:4041/promoteAdmin
  router.put("/promoteAdmin", async (req: any, res: any): Promise<void> => {
    const { email, newRole } = req.body;
    const userEmail = req.user.email;
    const validRoles = [
      "Ceo",
      "Coo",
      "Gerente",
      "Vendedor",
      "Parceiro",
      "Cliente",
      "Membro",
    ];

    try {
      if (!email || !newRole || !validRoles.includes(newRole)) {
        res
          .status(400)
          .json({ error: "Email and a valid new role are required." });
        return;
      }

      const adminStatus = await isAdmin(userEmail);

      if (!adminStatus) {
        res.status(401).json({ error: "Not Is Admin." });
        return;
      }

      const existingAdmin = await prisma.admin.findUnique({
        where: { email },
      });

      if (!existingAdmin) {
        res.status(404).json({ error: "Admin not found." });
        return;
      }

      const updatedAdmin = await prisma.admin.update({
        where: { email },
        data: { role: newRole },
      });

      res.status(200).json(updatedAdmin);
    } catch (error) {
      console.error("Error promoting admin:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  });

  // http://localhost:4041/demitAdmin
  // Rota para demitir um administrador
  router.delete("/demitAdmin", async (req: any, res: any): Promise<void> => {
    const { email } = req.body;
    const userEmail = req.user.email;

    try {
      if (!email) {
        res.status(400).json({ error: "Email is required." });
        return;
      }
      const adminStatus = await isAdmin(userEmail);

      if (!adminStatus) {
        res.status(401).json({ error: "Not Is Admin." });
        return;
      }

      const existingAdmin = await prisma.admin.findUnique({
        where: { email },
      });

      if (!existingAdmin) {
        res.status(404).json({ error: "Admin not found." });
        return;
      }

      await prisma.admin.delete({
        where: { email },
      });

      res.status(200).json({ message: "Admin demitted successfully." });
    } catch (error) {
      console.error("Error demitting admin:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  });

  // http://localhost:4041/checkIsAdmin
  router.post(
    "/checkIsAdmin",
    authenticateJWT,
    async (req: any, res: any): Promise<void> => {
      const { email } = req.body;

      try {
        if (!email) {
          res.status(400).json({ error: "Role and email are required." });
          return;
        }
        const validAdmins = ["Ceo", "Coo", "Gerente"];

        const existingEmail = await prisma.user.findUnique({
          where: { email },
        });

        if (!existingEmail) {
          res.status(400).json({ error: "Email não cadastrado." });
          return;
        }
        const existingAdmin = await prisma.admin.findUnique({
          where: { email },
        });
        if (!existingAdmin) {
          res.status(400).json({ error: "Email não cadastrado." });
          return;
        }

        if (validAdmins.includes(existingAdmin.role)) {
          res.status(200).send(true);
          return;
        } else {
          res.status(200).send(false);
          return;
        }
        res.status(200).send(false);
        return;
      } catch (error) {
        console.error("Erro ao inserir ou atualizar administrador:", error);
        res.status(500).json({ error: "Internal server error." });
      }
    }
  );

  // http://localhost:4041/deleteLicense
  router.post(
    "/deleteLicense",
    authenticateJWT,
    async (req: any, res: any): Promise<any> => {
      const { license } = req.body;
      const userEmail = req.user.email;

      try {
        if (!license) {
          res.status(401).json({ error: "License is required." });
          return;
        }

        const adminStatus = await isAdmin(userEmail);

        if (!adminStatus) {
          res.status(401).json({ error: "Not Is Admin." });
          return;
        }

        const deleteSecret = await deleteLicense(prisma, license);
        if (deleteSecret) {
          res.status(200).json({ message: "Licensa deletada com sucesso" });
          return;
        }
      } catch (error) {
        res.status(404).json({ error: error });
      }
    }
  );

  // http://localhost:4041/editIp
  // Rota para editar ip
  router.post(
    "/editIp",
    authenticateJWT,
    async (req: any, res: any): Promise<any> => {
      const { license, ip } = req.body;
      const userEmail = req.user.email;

      try {
        if (!license) {
          res.status(401).json({ error: "License is required." });
          return;
        }
        if (!ip) {
          res.status(401).json({ error: "IP is required." });
          return;
        }

        const adminStatus = await isAdmin(userEmail);

        if (!adminStatus) {
          res.status(401).json({ error: "Not Is Admin." });
          return;
        }
        const isAlterIp = await alteruserIp(license, ip);
        if (isAlterIp) {
          res.status(200).json({ message: "IP alterado com sucesso." });
          return;
        } else {
          res.status(404).json({ error: "License not found." });
        }
      } catch (error) {
        console.error("Error in editIp:", error);
        res.status(500).json({ error: "Internal server error." });
      }
    }
  );

  // http://localhost:4041/getUserInfos
  // Rota para pegar informações do usuario
  router.post(
    "/getUserInfos",
    authenticateJWT,
    async (req: any, res: any): Promise<any> => {
      const userEmail = req.user.email;

      try {
        const adminStatus = await isAdmin(userEmail);

        if (!adminStatus) {
          res.status(401).json({ error: "Not Is Admin." });
          return;
        }

        const getUser = await getUserInfos(req.body);
        if (getUser) {
          res.status(200).json(getUser);
          return;
        } else {
          res.status(404).json({ error: "User not found." });
        }
      } catch (error) {
        console.error("Error in get user:", error);
        res.status(500).json({ error: "Internal server error." });
      }
    }
  );

  // http://localhost:4041/shop/createCategory
  // Rota para criar categoria de produtos
  router.post(
    "/shop/createCategory",
    authenticateJWT,
    async (req: any, res: any) => {
      const { name } = req.body;
      const userEmail = req.user.email;
      try {
        const adminStatus = await isAdmin(userEmail);

        if (!adminStatus) {
          res.status(401).json({ error: "Not Is Admin." });
          return;
        }

        if (!name) {
          res.status(401).json({ error: "name is required." });
          return;
        }
        const isCreate = await createCategory(name);

        if (isCreate) {
          res
            .status(200)
            .json({ message: "Categoria de produtos criada com sucesso." });
          return;
        } else {
          res
            .status(401)
            .json({ error: "falha ao criar categoria de produtos." });
          return;
        }
      } catch (error) {
        console.error("Error in createCategory", error);
        res.status(500).json({ error: "Internal server error." });
      }
    }
  );

  // http://localhost:4041/shop/deleteCategory
  // Rota para deletar categoria de produtos
  router.post(
    "/shop/deleteCategory",
    authenticateJWT,
    async (req: any, res: any) => {
      const { name } = req.body;
      const userEmail = req.user.email;
      try {
        const adminStatus = await isAdmin(userEmail);

        if (!adminStatus) {
          res.status(401).json({ error: "Not Is Admin." });
          return;
        }

        if (!name) {
          res.status(401).json({ error: "name is required." });
          return;
        }
        const isDelete = await deleteCategory(name);

        if (isDelete) {
          res
            .status(200)
            .json({ message: "Categoria de produtos deletada com sucesso." });
          return;
        } else {
          res
            .status(401)
            .json({ error: "falha ao deletar categoria de produtos." });
          return;
        }
      } catch (error) {
        console.error("Error in deleteCategory", error);
        res.status(500).json({ error: "Internal server error." });
      }
    }
  );

  // http://localhost:4041/shop/allProducts
  // Rota para pegar todos os produtos
  router.get("/shop/allProducts", authenticateJWT, async (_: any, res: any) => {
    try {
      const AllProducts = await getAllProducts();
      if (AllProducts) {
        console.log(AllProducts);
        res.status(200).json({ AllProducts });
        return;
      } else {
        res.status(401).json({ error: "Falha ao coletar produtos." });
        return;
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error." });
    }
  });

  // http://localhost:4041/shop/createProduct
  // Rota para criar produtos
  router.post(
    "/shop/createProduct",
    authenticateJWT,
    async (req: any, res: any) => {
      const { name, description, price, stock, categoryId } = req.body;
      const userEmail = req.user.email;
      try {
        const adminStatus = await isAdmin(userEmail);

        if (!adminStatus) {
          res.status(401).json({ error: "Not Is Admin." });
          return;
        }
        const isCreateProduct = await createProduct(
          name,
          description,
          price,
          stock,
          categoryId
        );
        if (isCreateProduct) {
          res.status(200).json({ message: "Produto criado com sucesso." });
          return;
        } else {
          res.status(401).json({ error: "falha ao criar produto." });
          return;
        }
      } catch (error) {
        res.status(500).json({ error: "Internal server error." });
      }
    }
  );
  // http://localhost:4041/shop/deleteProduct
  // Rota para deletar produtos
  router.post(
    "/shop/deleteProduct",
    authenticateJWT,
    async (req: any, res: any) => {
      const { id } = req.body;
      const userEmail = req.user.email;
      try {
        const adminStatus = await isAdmin(userEmail);

        if (!adminStatus) {
          res.status(401).json({ error: "Not Is Admin." });
          return;
        }
        if (!id) {
          res.status(401).json({ error: "id do produto não definido." });
          return;
        }

        const isDeleteProduct = await deleteProduct(id);
        if (isDeleteProduct) {
          res.status(200).json({ message: "Produto deletado com sucesso." });
          return;
        } else {
          res.status(401).json({ error: "falha ao deletar produto." });
          return;
        }
      } catch (error) {
        res.status(500).json({ error: "Internal server error." });
      }
    }
  );
  // http://localhost:4041/shop/updateProduct
  // Rota para atualizar produtos
  router.put(
    "/shop/updateProduct",
    authenticateJWT,
    async (req: any, res: any) => {
      const { id, name, description, price, stock, categoryId, image } =
        req.body;
      const userEmail = req.user.email;
      try {
        const adminStatus = await isAdmin(userEmail);

        if (!adminStatus) {
          res.status(401).json({ error: "Not Is Admin." });
          return;
        }
        const isUpdated = await updateProduct(
          id,
          name,
          description,
          price,
          stock,
          categoryId,
          image
        );
        if (isUpdated) {
          res.status(200).json({ message: "Produto atualizado com sucesso." });
          return;
        } else {
          res.status(401).json({ error: "falha ao atualizar produto." });
          return;
        }
      } catch (error) {
        res.status(500).json({ error: "Internal server error." });
      }
    }
  );

  return router;
};
