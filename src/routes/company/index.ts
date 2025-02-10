import {FastifyPluginAsync} from "fastify"

interface Company {
    id: string;
    parentId?: string | null;
    name: string;
    children: Map<string, Company>;
}

// In-memory storage using a Map
const companyMap = new Map<string, Company>();

const company: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
    fastify.post('/', {
        schema: {
            body: {
                type: "object",
                required: ["id", "name"],
                properties: {
                    id: {type: "string"},
                    parentId: {type: ["string", "null"], nullable: true},
                    name: {type: "string"},
                },
            },
        },
    }, async function (request, reply) {
        const {id, parentId, name} = request.body as Company;

        if (companyMap.has(id)) {
            return reply.status(400).send({error: "Company Id already exists"});
        }

        const newCompany = {id, parentId, name, children: new Map<string, Company>()};

        if (parentId) {
            const parentCompany = companyMap.get(parentId);
            if (!parentCompany) {
                return reply.status(400).send({error: "Parent company not found"});
            }
            parentCompany.children.set(id, newCompany);
        }

        companyMap.set(id, newCompany);
        return reply.status(201).send({message: "Company data received",});
    });

    fastify.get<{ Params: { id: string } }>('/:id', async function (request, reply) {
        const company = companyMap.get(request.params.id);
        if (!company) {
            return reply.status(404).send({error: "Company not found"});
        }

        return reply.status(200).send({
            id: company.id,
            parentId: company.parentId ?? null,
            name: company.name
        })
    });

    fastify.get<{ Params: { id: string } }>('/:id/descendants', async function (request, reply) {
        const company = companyMap.get(request.params.id);
        if (!company) {
            return reply.status(404).send({error: "Company not found"});
        }

        const serializeCompanyTree = (c: Company): any => ({
            id: c.id,
            parentId: c.parentId ?? null,
            name: c.name,
            children: [...c.children.values()].map(serializeCompanyTree),
        });

        return reply.send(serializeCompanyTree(company));
    });
}

export default company;
