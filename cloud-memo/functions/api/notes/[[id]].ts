interface Env {
    MEMO_KV: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const url = new URL(context.request.url);
    // URL: /api/notes/:id
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];

    if (!id || id === 'notes') {
        return new Response(JSON.stringify({ error: 'ID is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const value = await context.env.MEMO_KV.get(id);

    return new Response(JSON.stringify({ content: value || '' }), {
        headers: { 'Content-Type': 'application/json' },
    });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const url = new URL(context.request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];

    if (!id || id === 'notes') {
        return new Response(JSON.stringify({ error: 'ID is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { content } = await context.request.json() as { content: string };

        // 最大 100,000字 (plsk準拠)
        const truncatedContent = content.slice(0, 100000);

        await context.env.MEMO_KV.put(id, truncatedContent);

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Failed to save' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
