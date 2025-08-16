/**
 * Enumeration for selecting the repository type.
 */
export var RepositoryType;
(function (RepositoryType) {
    RepositoryType["PostgreSQL"] = "postgresql";
    RepositoryType["MongoDB"] = "mongodb";
    RepositoryType["MySQL"] = "mysql";
})(RepositoryType || (RepositoryType = {}));
