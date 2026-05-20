export interface XMLDocument {
    rootElement?: XMLElement;
}

export interface XMLElement {
    name?: string;
    attributes: XMLAttribute[];
    subElements: XMLElement[];
    syntax: {
        openName?: XMLToken;
        closeName?: XMLToken;
    };
}

export interface XMLAttribute {
    key?: string;
    value?: string;
    syntax: {
        value?: XMLToken;
    };
}

export interface XMLToken {
    startOffset: number;
    image: string;
}

interface CstLike {
    children?: Record<string, unknown>;
}

interface TokenLike {
    startOffset: number;
    image: string;
}

function toToken(token: TokenLike | undefined): XMLToken | undefined {
    if (!token) {
        return undefined;
    }
    return { startOffset: token.startOffset, image: token.image };
}

function buildAttribute(attrCst: CstLike): XMLAttribute {
    const children = (attrCst.children ?? {}) as {
        Name?: TokenLike[];
        STRING?: TokenLike[];
    };
    const nameToken = children.Name?.[0];
    const valueToken = children.STRING?.[0];

    let value: string | undefined;
    if (valueToken && valueToken.image.length >= 2) {
        //strip surrounding quotes (single or double)
        value = valueToken.image.slice(1, -1);
    }

    return {
        key: nameToken?.image,
        value: value,
        syntax: {
            value: toToken(valueToken)
        }
    };
}

function collectSubElements(contentCsts: CstLike[] | undefined): XMLElement[] {
    if (!contentCsts) {
        return [];
    }
    const result: XMLElement[] = [];
    for (const contentCst of contentCsts) {
        const elements = ((contentCst.children ?? {}) as { element?: CstLike[] }).element;
        if (elements) {
            for (const el of elements) {
                result.push(buildElement(el));
            }
        }
    }
    return result;
}

function buildElement(elementCst: CstLike): XMLElement {
    const children = (elementCst.children ?? {}) as {
        Name?: TokenLike[];
        END_NAME?: TokenLike[];
        attribute?: CstLike[];
        content?: CstLike[];
    };
    const openName = children.Name?.[0];
    const closeName = children.END_NAME?.[0];

    return {
        name: openName?.image,
        attributes: (children.attribute ?? []).map(buildAttribute),
        subElements: collectSubElements(children.content),
        syntax: {
            openName: toToken(openName),
            closeName: toToken(closeName)
        }
    };
}

/**
 * Build a minimal XML AST from the CST returned by `@xml-tools/parser`.
 * Only contains the fields ropm actually consumes.
 */
export function buildAst(cst: CstLike, _tokenVector?: unknown): XMLDocument {
    const rootCst = ((cst.children ?? {}) as { element?: CstLike[] }).element?.[0];
    return {
        rootElement: rootCst ? buildElement(rootCst) : undefined
    };
}
