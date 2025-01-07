const validateMetadata = (metadata) => {
    const required = ['name', 'description', 'image'];
    const errors = [];

    required.forEach(field => {
        if (!metadata[field]) {
            errors.push(`Missing required field: ${field}`);
        }
    });

    if (metadata.attributes) {
        if (!Array.isArray(metadata.attributes)) {
            errors.push('Attributes must be an array');
        } else {
            metadata.attributes.forEach((attr, index) => {
                if (!attr.trait_type || !attr.value) {
                    errors.push(`Invalid attribute at index ${index}`);
                }
            });
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

const validateIPFSHash = (hash) => {
    const ipfsPattern = /^(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})/;
    return ipfsPattern.test(hash);
};

module.exports = { validateMetadata, validateIPFSHash };