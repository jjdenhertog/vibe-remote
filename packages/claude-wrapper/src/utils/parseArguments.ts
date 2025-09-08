type ParsedArguments = {
    createPr: boolean;
    review: boolean;
    merge: boolean;
};

export function parseArguments(args: string[]): ParsedArguments {
    return {
        createPr: args.includes('--create-pr'),
        review: args.includes('--review'),
        merge: args.includes('--merge')
    };
}