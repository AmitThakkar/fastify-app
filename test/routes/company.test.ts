import {test} from 'node:test'
import * as assert from 'node:assert'
import {build} from '../helper'

test("Company API", async (t) => {
    const app = await build(t)

    await t.test('New company store error when name missing', async (t) => {
        const res = await app.inject({
            method: "POST",
            url: "/company",
            payload: {
                id: "123",
                parentId: null,
            },
        })
        assert.equal(res.statusCode, 400);
        assert.match(res.headers['content-type'], /application\/json/, 'Response should be JSON');
        assert.deepStrictEqual(JSON.parse(res.payload), {
            statusCode: 400,
            code: "FST_ERR_VALIDATION",
            error: "Bad Request",
            message: "body must have required property 'name'"
        });
    });

    await t.test('New company store error when id missing', async (t) => {
        const res = await app.inject({
            method: "POST",
            url: "/company",
            payload: {
                parentId: null,
                name: "Test Company 123",
            },
        })
        assert.equal(res.statusCode, 400);
        assert.match(res.headers['content-type'], /application\/json/, 'Response should be JSON');
        assert.deepStrictEqual(JSON.parse(res.payload), {
            statusCode: 400,
            code: "FST_ERR_VALIDATION",
            error: "Bad Request",
            message: "body must have required property 'id'"
        });
    });

    await t.test('New company store error with empty body', async (t) => {
        const res = await app.inject({
            method: "POST",
            url: "/company",
            payload: {},
        })
        assert.equal(res.statusCode, 400);
        assert.match(res.headers['content-type'], /application\/json/, 'Response should be JSON');
        assert.deepStrictEqual(JSON.parse(res.payload), {
            statusCode: 400,
            code: "FST_ERR_VALIDATION",
            error: "Bad Request",
            message: "body must have required property 'id'"
        });
    });

    await t.test('New company store error when provided parent id missing', async (t) => {
        const app = await build(t)
        const res = await app.inject({
            method: "POST",
            url: "/company",
            payload: {
                id: "12",
                parentId: "1",
                name: "Test Company 12",
            },
        })
        assert.equal(res.statusCode, 400);
        assert.match(res.headers['content-type'], /application\/json/, 'Response should be JSON');
        assert.deepStrictEqual(JSON.parse(res.payload), {error: "Parent company not found"});
    });

    await t.test('New company stored without parent id', async (t) => {
        const res = await app.inject({
            method: "POST",
            url: "/company",
            payload: {
                id: "123",
                name: "Test Company 123",
            },
        })
        assert.equal(res.statusCode, 201);
        assert.match(res.headers['content-type'], /application\/json/, 'Response should be JSON');
        assert.deepStrictEqual(JSON.parse(res.payload), {
            message: "Company data received",
        });
    });

    await t.test('New company stored when parent id present', async (t) => {
        const app = await build(t)
        const res = await app.inject({
            method: "POST",
            url: "/company",
            payload: {
                id: "124",
                parentId: "123",
                name: "Test Company 124",
            },
        })
        assert.equal(res.statusCode, 201);
        assert.match(res.headers['content-type'], /application\/json/, 'Response should be JSON');
        assert.deepStrictEqual(JSON.parse(res.payload), {
            message: "Company data received",
        });
    });

    await t.test('New company stored when its second child', async (t) => {
        const app = await build(t)
        const res = await app.inject({
            method: "POST",
            url: "/company",
            payload: {
                id: "125",
                parentId: "123",
                name: "Test Company 125",
            },
        })
        assert.equal(res.statusCode, 201);
        assert.match(res.headers['content-type'], /application\/json/, 'Response should be JSON');
        assert.deepStrictEqual(JSON.parse(res.payload), {
            message: "Company data received",
        });
    });

    await t.test('New company stored when its nested child', async (t) => {
        const app = await build(t)
        const res = await app.inject({
            method: "POST",
            url: "/company",
            payload: {
                id: "126",
                parentId: "124",
                name: "Test Company 126",
            },
        })
        assert.equal(res.statusCode, 201);
        assert.match(res.headers['content-type'], /application\/json/, 'Response should be JSON');
        assert.deepStrictEqual(JSON.parse(res.payload), {
            message: "Company data received",
        });
    });

    await t.test('company not found', async (t) => {
        const app = await build(t)
        const res = await app.inject({
            url: '/company/2'
        })
        assert.equal(res.statusCode, 404);
        assert.match(res.headers['content-type'], /application\/json/, 'Response should be JSON');
        assert.deepStrictEqual(JSON.parse(res.payload), {error: "Company not found"})
    });

    await t.test('company found with parent', async (t) => {
        const app = await build(t)
        const res = await app.inject({
            url: '/company/124'
        })
        assert.equal(res.statusCode, 200);
        assert.match(res.headers['content-type'], /application\/json/, 'Response should be JSON');
        assert.deepStrictEqual(JSON.parse(res.payload), {
            id: "124",
            parentId: "123",
            name: "Test Company 124"
        })
    });

    await t.test('company found without parent', async (t) => {
        const app = await build(t)
        const res = await app.inject({
            url: '/company/123'
        })
        assert.equal(res.statusCode, 200);
        assert.match(res.headers['content-type'], /application\/json/, 'Response should be JSON');
        assert.deepStrictEqual(JSON.parse(res.payload), {id: "123", parentId: null, name: "Test Company 123"})
    });

    /*
    Company: 123
    Children:
        Company: 124
        Children:
            Company: 126
        Company: 125
     */

    await t.test('parent company not found', async (t) => {
        const app = await build(t)
        const res = await app.inject({
            url: '/company/2/descendants'
        })
        assert.equal(res.statusCode, 404);
        assert.match(res.headers['content-type'], /application\/json/, 'Response should be JSON');
        assert.deepStrictEqual(JSON.parse(res.payload), {error: "Company not found"})
    });

    await t.test('no subsidiaries', async (t) => {
        const app = await build(t)
        const res = await app.inject({
            url: '/company/125/descendants'
        })
        assert.equal(res.statusCode, 200);
        assert.match(res.headers['content-type'], /application\/json/, 'Response should be JSON');
        assert.deepStrictEqual(JSON.parse(res.payload), {
            id: "125",
            parentId: "123",
            name: "Test Company 125",
            children: []
        });
    });

    await t.test('one leve subsidiaries', async (t) => {
        const app = await build(t);
        const res = await app.inject({
            url: '/company/124/descendants'
        });
        assert.equal(res.statusCode, 200);
        assert.match(res.headers['content-type'], /application\/json/, 'Response should be JSON');
        assert.deepStrictEqual(JSON.parse(res.payload), {
            id: "124",
            parentId: "123",
            name: "Test Company 124",
            children: [
                {
                    id: "126",
                    parentId: "124",
                    name: "Test Company 126",
                    children: []
                }
            ]
        });
    });

    await t.test('two level of subsidiaries', async (t) => {
        const app = await build(t);
        const res = await app.inject({
            url: '/company/123/descendants'
        });
        assert.equal(res.statusCode, 200);
        assert.match(res.headers['content-type'], /application\/json/, 'Response should be JSON');
        assert.deepStrictEqual(JSON.parse(res.payload), {
            id: "123",
            parentId: null,
            name: "Test Company 123",
            children: [
                {
                    id: "124",
                    parentId: "123",
                    name: "Test Company 124",
                    children: [
                        {
                            id: "126",
                            parentId: "124",
                            name: "Test Company 126",
                            children: []
                        }
                    ]
                },
                {
                    id: "125",
                    parentId: "123",
                    name: "Test Company 125",
                    children: []
                }
            ]
        });
    });
});