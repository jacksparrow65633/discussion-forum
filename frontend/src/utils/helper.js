
export const getInitials = (title) => {
    if(!title) return "";

    const words = title.split(" ");
    let initials = "";

    for (let i = 0; i < Math.min(words.length, 2); i++) {
        initials += words[i][0];
    }

    return initials.toUpperCase();
}

export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email)
}

export const getToastMessagesByTypes = (type) => {
    switch (type) {
        case "edit":
            return "Post updated successfuly";
        case "draft":
            return "Post saved as draft successfuly";
        case "published":
            return "Post published successfuly";

        default:
            return "Post published successfuly";
    }
}

export const sanitizeMarkdown = (content) => {
    const markdownBlockRegex = /^```(?:markdown)?\n([\s\S]*?)\n```$/
    const match = content.match(markdownBlockRegex)
    return match ? match[1] : content;
}